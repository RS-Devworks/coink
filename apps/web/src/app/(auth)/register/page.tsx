import Link from 'next/link'
import RegisterForm from './_components/register-form'

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-muted-foreground mt-2">
          Comece sua jornada financeira conosco
        </p>
      </div>
      
      <RegisterForm />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}