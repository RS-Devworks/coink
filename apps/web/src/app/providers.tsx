'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactQueryProvider } from '@/lib/react-query'
import EventProvider from '@/components/event-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <EventProvider>
          {children}
        </EventProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}