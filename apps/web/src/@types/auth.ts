export interface User {
  id: string
  email: string
  name: string
  lastAccess: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}