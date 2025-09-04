'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEventLogger } from '@/lib/event-system'

interface EventProviderProps {
  children: React.ReactNode
}

export default function EventProvider({ children }: EventProviderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const eventLogger = useEventLogger()

  // Configurar userId quando usuário faz login
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      eventLogger.setUserId(session.user.id)
      
      // Log da sessão iniciada
      eventLogger.logAction('session_started', {
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email
      })
    }
  }, [session, status, eventLogger])

  // Log de navegação
  useEffect(() => {
    let previousPath = sessionStorage.getItem('previousPath')
    
    if (previousPath && previousPath !== pathname) {
      eventLogger.logNavigation(pathname, previousPath)
    }
    
    sessionStorage.setItem('previousPath', pathname)
  }, [pathname, eventLogger])

  // Log de ações de página
  useEffect(() => {
    const handlePageAction = (action: string, data?: any) => {
      eventLogger.logAction(action, {
        page: pathname,
        ...data
      })
    }

    // Log de scroll
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent % 25 === 0 && scrollPercent > 0) { // Log a cada 25%
        handlePageAction('page_scroll', { scrollPercent })
      }
    }

    // Log de tempo na página
    const pageStartTime = Date.now()
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime
      handlePageAction('page_time', { 
        duration: timeOnPage,
        timeOnPageSeconds: Math.round(timeOnPage / 1000)
      })
    }

    // Log de cliques em elementos importantes
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Log cliques em botões, links, cards
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('[data-track-click]')) {
        const elementText = target.textContent?.slice(0, 50) || 'unknown'
        const elementId = target.id || target.className.slice(0, 50)
        
        handlePageAction('element_click', {
          elementType: target.tagName.toLowerCase(),
          elementText,
          elementId,
          x: event.clientX,
          y: event.clientY
        })
      }
    }

    // Adicionar listeners apenas se autenticado
    if (status === 'authenticated') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('beforeunload', handleBeforeUnload)
      document.addEventListener('click', handleClick)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleClick)
    }
  }, [pathname, eventLogger, status])

  // Log de erros JavaScript
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      eventLogger.logAction('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        page: pathname
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      eventLogger.logAction('promise_rejection', {
        reason: event.reason?.toString() || 'unknown',
        page: pathname
      })
    }

    if (status === 'authenticated') {
      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)
    }

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [eventLogger, pathname, status])

  return <>{children}</>
}
