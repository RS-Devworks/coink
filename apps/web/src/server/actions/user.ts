'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function getUserProfile() {
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

export async function updateUserProfile(profileData: {
  name?: string
  email?: string
}) {
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

export async function updateUserPassword(passwordData: {
  currentPassword: string
  newPassword: string
}) {
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

export async function deleteUserAccount() {
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

    return { success: true, message: 'Conta excluída com sucesso' }
  } catch (error: any) {
    console.error('Erro ao excluir conta:', error)
    return { 
      success: false, 
      error: 'Erro interno do servidor' 
    }
  }
}