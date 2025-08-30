'use server'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreateTransactionRequest } from '@/@types/transaction'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function getTransactions() {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao carregar transações'
    }
  }
}

export async function createTransaction(data: CreateTransactionRequest) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/transactions`, data, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao criar transação:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao criar transação'
    }
  }
}

export async function updateTransaction(id: string, data: Partial<CreateTransactionRequest>) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.patch(`${API_BASE_URL}/transactions/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: any) {
    console.error('Erro ao atualizar transação:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao atualizar transação'
    }
  }
}

export async function deleteTransaction(id: string) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    await axios.delete(`${API_BASE_URL}/transactions/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar transação:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao deletar transação'
    }
  }
}