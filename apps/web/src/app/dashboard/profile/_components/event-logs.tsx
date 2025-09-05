'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Activity, Eye, EyeOff } from 'lucide-react'
import { getUserEvents, getUserEventStats } from '@/server/actions/profile'

// Interface para eventos (mantida para compatibilidade com a API)
interface EventData {
  id: string
  type: string
  sessionId: string
  metadata: string
  timestamp: string
  serverTimestamp: string
  ip?: string
  userAgent?: string
}

interface EventLogsProps {
  className?: string
}

export default function EventLogs({ className }: EventLogsProps) {
  const [events, setEvents] = useState<EventData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const [eventsResult, statsResult] = await Promise.all([
        getUserEvents(50),
        getUserEventStats()
      ])

      if (eventsResult.success) {
        setEvents(eventsResult.data?.events || [])
      } else {
        console.error('❌ Erro ao carregar eventos:', eventsResult.error)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      } else {
        console.error('❌ Erro ao carregar estatísticas:', statsResult.error)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      loadEvents()
    }
  }, [isVisible])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'logout': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'photo_upload': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'navigation': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'action': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={className}
      >
        <Eye className="w-4 h-4 mr-2" />
        Ver Logs de Eventos
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Logs de Eventos
              {stats && (
                <Badge variant="secondary">
                  {stats.totalEvents} eventos
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadEvents}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.sessionsCount}</div>
                <div className="text-xs text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{Object.keys(stats.eventsByType).length}</div>
                <div className="text-xs text-muted-foreground">Tipos</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {stats.lastEvent ? 'Ativo' : 'Inativo'}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          )}

          <Separator />

          {/* Lista de eventos */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoading ? 'Carregando eventos...' : 'Nenhum evento encontrado'}
                </div>
              ) : (
                events.map((event, index) => (
                  <motion.div
                    key={`${event.sessionId}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getEventTypeColor(event.type)} variant="secondary">
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp && formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      {event.metadata && (
                        <div className="text-sm">
                          {(() => {
                            try {
                              const metadata = JSON.parse(event.metadata)
                              
                              if (event.type === 'LOGIN') {
                                return (
                                  <div>
                                    <span className="font-medium">
                                      Login {metadata.success ? 'bem-sucedido' : 'falhou'}
                                    </span>
                                    {metadata.loginMethod && (
                                      <span className="text-muted-foreground ml-2">
                                        ({metadata.loginMethod})
                                      </span>
                                    )}
                                    {metadata.errorMessage && (
                                      <span className="text-destructive ml-2">
                                        - {metadata.errorMessage}
                                      </span>
                                    )}
                                  </div>
                                )
                              }
                              
                              if (event.type === 'PHOTO_UPLOAD') {
                                return (
                                  <div>
                                    <span className="font-medium">
                                      Upload de foto {metadata.success ? 'bem-sucedido' : 'falhou'}
                                    </span>
                                    {metadata.fileName && (
                                      <span className="text-muted-foreground ml-2">
                                        {metadata.fileName}
                                      </span>
                                    )}
                                    {metadata.errorMessage && (
                                      <span className="text-destructive ml-2">
                                        - {metadata.errorMessage}
                                      </span>
                                    )}
                                  </div>
                                )
                              }
                              
                              if (event.type === 'PROFILE_UPDATE') {
                                return (
                                  <div>
                                    <span className="font-medium">Perfil atualizado:</span>
                                    <span className="text-muted-foreground ml-2">
                                      {metadata.action || 'dados alterados'}
                                    </span>
                                    {metadata.changes && (
                                      <span className="text-muted-foreground ml-2">
                                        ({metadata.changes.join(', ')})
                                      </span>
                                    )}
                                  </div>
                                )
                              }
                              
                              if (event.type === 'ACTION') {
                                return (
                                  <div>
                                    <span className="font-medium">Ação:</span>
                                    <span className="text-muted-foreground ml-2">
                                      {metadata.action}
                                    </span>
                                    {metadata.transactionId && (
                                      <span className="text-muted-foreground ml-2">
                                        (ID: {metadata.transactionId.slice(0, 8)}...)
                                      </span>
                                    )}
                                  </div>
                                )
                              }
                              
                              return (
                                <div>
                                  <span className="font-medium">Evento:</span>
                                  <span className="text-muted-foreground ml-2">
                                    {event.type.toLowerCase()}
                                  </span>
                                </div>
                              )
                            } catch {
                              return (
                                <div>
                                  <span className="font-medium">Evento:</span>
                                  <span className="text-muted-foreground ml-2">
                                    {event.type.toLowerCase()}
                                  </span>
                                </div>
                              )
                            }
                          })()}
                        </div>
                      )}
                      
                      {event.sessionId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Sessão: {event.sessionId.slice(-8)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}
