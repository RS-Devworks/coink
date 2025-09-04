import { AppSidebar } from './_components/app-sidebar'
import DashboardHeader from './_components/dashboard-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Verificar autenticação no nível do layout
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
