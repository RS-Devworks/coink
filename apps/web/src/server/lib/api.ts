import axios, { AxiosError, AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Adiciona token automaticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession()
      
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
      }
      
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
      
      return config
    } catch (error) {
      console.error('[API Request Error]:', error)
      return config
    }
  },
  (error: AxiosError) => {
    console.error('[API Request Interceptor Error]:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor - Trata respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url
    
    console.error(`[API Error] ${status} ${url}`, error.response?.data)

    // Estrutura de erro personalizada baseada no status
    switch (status) {
      case 401:
        console.error('[API] Token inválido ou expirado')
        // NextAuth vai lidar com o redirecionamento
        break
      case 403:
        console.error('[API] Acesso negado')
        break
      case 404:
        console.error('[API] Recurso não encontrado')
        break
      case 422:
        console.error('[API] Dados de validação inválidos')
        break
      case 500:
        console.error('[API] Erro interno do servidor')
        break
      default:
        if (!error.response) {
          console.error('[API] Erro de rede ou servidor indisponível')
        }
    }

    return Promise.reject(error)
  }
)

export default api