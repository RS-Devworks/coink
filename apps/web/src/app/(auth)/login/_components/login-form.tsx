'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEventLogger } from '@/lib/event-system'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventLogger = useEventLogger()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    const loginStartTime = Date.now()

    try {
      const { signIn } = await import('next-auth/react')
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        // Log evento de login falho
        await eventLogger.logLogin({
          loginMethod: 'email',
          success: false,
          errorMessage: 'Credenciais inválidas',
          metadata: {
            email: data.email,
            duration: Date.now() - loginStartTime,
            errorType: 'invalid_credentials'
          }
        })
        setError('Credenciais inválidas. Verifique seu email e senha.')
      } else if (result?.ok) {
        // Log evento de login bem-sucedido
        await eventLogger.logLogin({
          loginMethod: 'email',
          success: true,
          metadata: {
            email: data.email,
            duration: Date.now() - loginStartTime
          }
        })
        
        // Log navegação para dashboard
        await eventLogger.logNavigation('/dashboard', '/login')
        
        window.location.href = '/dashboard'
      }
    } catch (err) {
      // Log erro geral
      await eventLogger.logLogin({
        loginMethod: 'email',
        success: false,
        errorMessage: 'Erro interno',
        metadata: {
          email: data.email,
          duration: Date.now() - loginStartTime,
          errorType: 'internal_error',
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        }
      })
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
        
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
            Esqueci minha senha
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}