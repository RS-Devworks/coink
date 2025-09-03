import Logo from '@/components/logo'

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
              <Logo />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}