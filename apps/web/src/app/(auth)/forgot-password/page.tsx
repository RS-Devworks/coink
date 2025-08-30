import Link from 'next/link'
import ForgotPasswordForm from './_components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Esqueci minha senha</h1>
        <p className="text-muted-foreground mt-2">
          Digite seu email para receber instruções de recuperação
        </p>
      </div>
      
      <ForgotPasswordForm />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Lembrou da senha?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}