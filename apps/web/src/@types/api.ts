// Tipos comuns para API
export interface ApiError {
  response?: {
    data?: {
      message?: string
    } | string[]
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}


