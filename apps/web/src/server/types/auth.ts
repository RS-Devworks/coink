import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password
          }, {
            headers: {
              'Content-Type': 'application/json',
            }
          })

          // Backend retorna: { accessToken, name, email, id }
          if (response.data?.accessToken) {
            return {
              id: response.data.id,
              email: response.data.email,
              name: response.data.name,
              accessToken: response.data.accessToken
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Credenciais inválidas')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // Persistir o accessToken do backend no JWT do NextAuth
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: any) {
      // Incluir dados do JWT na sessão
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours - mesmo tempo do backend
  },
  secret: process.env.NEXTAUTH_SECRET
}
