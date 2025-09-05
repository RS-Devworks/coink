'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactQueryProvider } from '@/lib/react-query'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    </SessionProvider>
  )
}