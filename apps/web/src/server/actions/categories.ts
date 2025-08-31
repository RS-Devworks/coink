'use server'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TransactionType } from '@/@types/transaction'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  type: TransactionType
}

export async function getCategories(type?: TransactionType) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const params = type ? `?type=${type}` : ''
    const response = await axios.get(`${API_BASE_URL}/categories${params}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao carregar categorias'
    }
  }
}

export async function createCategory(data: CreateCategoryRequest) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, data, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao criar categoria'
    }
  }
}

export async function setupDefaultCategories() {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/categories/setup-defaults`, {}, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao criar categorias padrão:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao criar categorias padrão'
    }
  }
}

export async function updateCategory(id: string, data: Partial<CreateCategoryRequest>) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.patch(`${API_BASE_URL}/categories/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao atualizar categoria'
    }
  }
}

export async function deleteCategory(id: string) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    await axios.delete(`${API_BASE_URL}/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao deletar categoria'
    }
  }
}