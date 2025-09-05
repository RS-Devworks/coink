'use server'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreateTransactionRequest, CreateInstallmentTransactionRequest, TransactionFilterParams } from '@/@types/transaction'
import { ApiError } from '@/@types/api'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function getErrorMessage(error: ApiError): string {
  const data = error.response?.data
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(', ')
  return data?.message || 'Erro desconhecido'
}

export async function getTransactions(filters?: TransactionFilterParams) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axios.get(`${API_BASE_URL}/transactions?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao buscar transações:', error)
    const apiError = error as ApiError
    return {
      success: false,
      error: getErrorMessage(apiError) || 'Erro ao carregar transações'
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
  } catch (error: unknown) {
    console.error('Erro ao criar transação:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao criar transação'
    }
  }
}

export async function createInstallmentTransaction(data: CreateInstallmentTransactionRequest) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/transactions/installments`, {
      description: data.description,
      totalAmount: data.totalAmount,
      type: data.type,
      paymentMethod: data.paymentMethod,
      categoryId: data.categoryId,
      installments: data.installments,
      firstPaymentDate: data.firstPaymentDate,
      interestRate: data.interestRate,
      downPayment: data.downPayment
    }, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao criar transação parcelada:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao criar transação parcelada'
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
  } catch (error: unknown) {
    console.error('Erro ao atualizar transação:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao atualizar transação'
    }
  }
}

export async function getMonthlyTransactionSummary(year: number, month: number) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/summary/${year}/${month}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao buscar resumo mensal:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao carregar resumo mensal'
    }
  }
}

export async function getInstallmentGroup(groupId: string) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/installments/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao buscar grupo de parcelas:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao carregar parcelas'
    }
  }
}

export async function markInstallmentAsPaid(id: string, isPaid: boolean) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.patch(`${API_BASE_URL}/transactions/${id}/payment-status`, { isPaid }, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao atualizar status de pagamento:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao atualizar status'
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
  } catch (error: unknown) {
    console.error('Erro ao deletar transação:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao deletar transação'
    }
  }
}

export async function editTransaction(id: string, data: Partial<CreateTransactionRequest>) {
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
  } catch (error: unknown) {
    console.error('Erro ao editar transação:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao editar transação'
    }
  }
}

export async function deleteInstallmentGroup(groupId: string) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    await axios.delete(`${API_BASE_URL}/transactions/installments/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('Erro ao deletar grupo de parcelas:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao deletar parcelas'
    }
  }
}

export async function getDashboardData() {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/dashboard`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao carregar dashboard'
    }
  }
}

export async function getTableData(filters?: TransactionFilterParams) {
  const session = await getSession()
  
  if (!session?.accessToken) {
    redirect('/login')
  }

  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axios.get(`${API_BASE_URL}/transactions/table?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    return { success: true, data: response.data }
  } catch (error: unknown) {
    console.error('Erro ao buscar dados da tabela:', error)
    return {
      success: false,
      error: getErrorMessage(error as ApiError) || 'Erro ao carregar tabela'
    }
  }
}