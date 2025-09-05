'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/server/actions/transactions'
import DashboardStats from './stats/dashboard-stats'
import FinancialOverview from './sections/financial-overview'
import CategoryInsights from './sections/category-insights'
import TrendsSection from './sections/trends-section'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart and recent transactions skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardContainer() {
  const {
    data: dashboardData,
    isLoading,
    error,
    // refetch, // Para futuras funcionalidades de refresh
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const result = await getDashboardData()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar dados do dashboard')
    }
  }, [error])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="text-muted-foreground">Tente novamente mais tarde</p>
        </div>
      </div>
    )
  }

  // Transformar dados para os componentes
  const statsData = {
    totalIncome: dashboardData.monthlySum.income,
    totalExpense: dashboardData.monthlySum.expense,
    balance: dashboardData.monthlySum.balance,
    totalTransactions: dashboardData.stats.totalTransactions,
    pendingInstallments: dashboardData.stats.pendingInstallments,
  }

  // Dados para o gráfico (últimos 6 meses)
  const chartData = [
    { name: 'Jan', receitas: 4500, despesas: 3200 },
    { name: 'Fev', receitas: 4500, despesas: 3800 },
    { name: 'Mar', receitas: 4500, despesas: 2900 },
    { name: 'Abr', receitas: 4500, despesas: 3500 },
    { name: 'Mai', receitas: 4500, despesas: 3100 },
    { name: 'Jun', receitas: 4500, despesas: dashboardData.monthlySum.expense },
  ]

  return (
    <div className="space-y-6">
      <DashboardStats 
        income={statsData.totalIncome}
        expense={statsData.totalExpense}
        balance={statsData.balance}
        transactionsCount={statsData.totalTransactions}
        pendingCount={statsData.pendingInstallments}
      />

      {/* Seção de visão financeira */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FinancialOverview
          chartData={chartData}
          recentTransactions={dashboardData.recentTransactions}
        />

        <CategoryInsights
          expensesByCategory={dashboardData.expensesByCategory}
          expensesByPaymentMethod={dashboardData.expensesByPaymentMethod || []}
          incomeByPaymentMethod={dashboardData.incomeByPaymentMethod || []}
        />
      </div>

      {/* Seção de tendências */}
      <TrendsSection
        categoryTrends={dashboardData.categoryTrends || { chartData: [], categories: [] }}
        incomeTrends={dashboardData.incomeTrends || { chartData: [], categories: [] }}
      />
    </div>
  )
}