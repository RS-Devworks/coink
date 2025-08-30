'use client'

import { useSession } from 'next-auth/react'
import api from '@/server/lib/api'

export function useApi() {
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated' && !!session?.accessToken
  const isLoading = status === 'loading'
  
  return {
    api,
    session,
    isAuthenticated,
    isLoading,
    user: session?.user
  }
}

export default useApi