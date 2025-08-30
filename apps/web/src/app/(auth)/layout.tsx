import { DollarSign } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Coink</span>
            </div>
          </div>
          {children}
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4">
                Simplifique suas finanças
              </h2>
              <p className="text-lg opacity-90">
                Controle total das suas transações em um só lugar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}