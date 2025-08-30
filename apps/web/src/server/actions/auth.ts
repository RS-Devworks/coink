'use server'

import { redirect } from 'next/navigation'
import { LoginRequest, RegisterRequest } from '@/@types/auth'
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
  } catch (error: any) {
    const message = error.response?.data?.message || 
                   (Array.isArray(error.response?.data) ? error.response.data.join(', ') : 'Erro no servidor')
    
    return { 
      success: false, 
      error: message
    }
  }
}

export async function logoutAction() {
  redirect('/login')
}