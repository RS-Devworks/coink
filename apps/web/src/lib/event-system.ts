// Sistema de eventos para capturar e enviar eventos para o backend
export interface EventData {
  type: 'login' | 'logout' | 'profile_update' | 'photo_upload' | 'navigation' | 'action'
  userId?: string
  metadata?: Record<string, any>
  timestamp?: string
  sessionId?: string
  userAgent?: string
  ip?: string
}

export interface LoginEventData extends EventData {
  type: 'login'
  loginMethod: 'email' | 'google' | 'github'
  success: boolean
  errorMessage?: string
}

export interface PhotoUploadEventData extends EventData {
  type: 'photo_upload'
  fileName: string
  fileSize: number
  fileType: string
  success: boolean
  errorMessage?: string
}

class EventLogger {
  private sessionId: string
  private userId?: string
  private eventQueue: EventData[] = []
  private isOnline: boolean = navigator.onLine
  private retryTimeout?: NodeJS.Timeout

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupOnlineListener()
    this.setupBeforeUnload()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushEventQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      // Enviar eventos pendentes antes de fechar a página
      if (this.eventQueue.length > 0) {
        this.sendEventsSync()
      }
    })
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  async logEvent(eventData: Partial<EventData>) {
    const event: EventData = {
      ...eventData,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...eventData
    } as EventData

    // Adicionar à fila
    this.eventQueue.push(event)

    // Tentar enviar imediatamente se online
    if (this.isOnline) {
      await this.flushEventQueue()
    }
  }

  async logLogin(data: Omit<LoginEventData, 'type' | 'userId' | 'sessionId' | 'timestamp'>) {
    await this.logEvent({
      type: 'login',
      ...data
    })
  }

  async logPhotoUpload(data: Omit<PhotoUploadEventData, 'type' | 'userId' | 'sessionId' | 'timestamp'>) {
    await this.logEvent({
      type: 'photo_upload',
      ...data
    })
  }

  async logNavigation(path: string, previousPath?: string) {
    await this.logEvent({
      type: 'navigation',
      metadata: {
        path,
        previousPath,
        referrer: document.referrer
      }
    })
  }

  async logAction(action: string, metadata?: Record<string, any>) {
    await this.logEvent({
      type: 'action',
      metadata: {
        action,
        ...metadata
      }
    })
  }

  private async flushEventQueue() {
    if (this.eventQueue.length === 0) return

    try {
      const events = [...this.eventQueue]
      this.eventQueue = []

      // Enviar para API NestJS
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${API_BASE_URL}/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          events: events.map(event => ({
            type: event.type.toUpperCase(),
            sessionId: event.sessionId,
            metadata: JSON.stringify(event.metadata || {}),
            timestamp: event.timestamp
          }))
        })
      })

      if (!response.ok) {
        // Se falhou, volta os eventos para a fila
        this.eventQueue.unshift(...events)
        throw new Error(`HTTP ${response.status}`)
      }

      console.log(`✅ ${events.length} eventos enviados com sucesso para API NestJS`)
    } catch (error) {
      console.error('❌ Erro ao enviar eventos:', error)
      
      // Retry após um tempo
      if (this.retryTimeout) clearTimeout(this.retryTimeout)
      this.retryTimeout = setTimeout(() => {
        this.flushEventQueue()
      }, 5000) // Retry em 5 segundos
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Importação dinâmica para evitar problemas de SSR
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      return session?.accessToken || null
    } catch {
      return null
    }
  }

  private async sendEventsSync() {
    // Tentar enviar eventos pendentes de forma síncrona
    if (this.eventQueue.length > 0) {
      try {
        const { logEvents } = await import('@/server/actions/events')
        await logEvents([...this.eventQueue])
        this.eventQueue = []
      } catch (error) {
        console.error('❌ Erro ao enviar eventos no unload:', error)
      }
    }
  }

  // Método para debug
  getQueueStatus() {
    return {
      queueLength: this.eventQueue.length,
      sessionId: this.sessionId,
      userId: this.userId,
      isOnline: this.isOnline
    }
  }
}

// Singleton instance
export const eventLogger = new EventLogger()

// Hook para usar em componentes React
export function useEventLogger() {
  return eventLogger
}
