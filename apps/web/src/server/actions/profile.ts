'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Tipos para as respostas
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
  lastAccess: string | null
  profilePhoto?: string | null
}

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

interface EventStats {
  totalEvents: number
  eventsByType: Record<string, number>
  sessionsCount: number
  lastEvent: string | null
}

// Buscar perfil do usuário
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao buscar perfil' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Atualizar perfil do usuário
export async function updateUserProfile(profileData: {
  name: string
  email: string
}): Promise<ApiResponse<UserProfile>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao atualizar perfil' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Atualizar senha do usuário
export async function updateUserPassword(passwordData: {
  currentPassword: string
  newPassword: string
}): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/users/profile/me/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao alterar senha' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Upload de foto do perfil
export async function uploadUserPhoto(photoBase64: string, fileName: string): Promise<ApiResponse<{ user: UserProfile }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoBase64,
        fileName,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao enviar foto' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao enviar foto:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Buscar eventos do usuário
export async function getUserEvents(limit: number = 50, type?: string): Promise<ApiResponse<{ events: EventData[], total: number, hasMore: boolean }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(type && { type }),
    })

    const response = await fetch(`${API_BASE_URL}/events?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao buscar eventos' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Buscar estatísticas de eventos
export async function getUserEventStats(): Promise<ApiResponse<EventStats>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/events/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao buscar estatísticas' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}

// Excluir conta do usuário
export async function deleteUserAccount(): Promise<ApiResponse<{ message: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'Não autenticado' }
    }

    const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || 'Erro ao excluir conta' 
      }
    }

    return { success: true, data: { message: 'Conta excluída com sucesso' } }
  } catch (error: any) {
    console.error('Erro ao excluir conta:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}
