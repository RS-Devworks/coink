// NextAuth type declarations

export declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    id?: string
    name?: string
    email?: string
  }
}