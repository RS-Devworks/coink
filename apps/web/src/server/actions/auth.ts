'use server'

import { redirect } from 'next/navigation'
import { RegisterRequest } from '@/@types/auth'
import api from '@/server/lib/api'

export async function registerAction(data: RegisterRequest) {
  try {
    const response = await api.post('/users', {
      name: data.name,
      email: data.email,
      password: data.password
    })
    
    // Backend retorna o usuário criado (sem password)
    if (response.data?.id) {
      return { success: true, data: response.data }
    }
    
    return { success: false, error: 'Erro ao criar conta' }
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } | string[] } }
    let message = 'Erro no servidor'

    if (apiError.response?.data) {
      if (Array.isArray(apiError.response.data)) {
        message = apiError.response.data.join(', ')
      } else if (typeof apiError.response.data === 'object' && 'message' in apiError.response.data) {
        message = (apiError.response.data as { message?: string }).message || message
      }
    }

    return { 
      success: false, 
      error: message
    }
  }
}

export async function logoutAction() {
  redirect('/login')
}