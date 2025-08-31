'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/server/actions/transactions'
import DashboardStats from './dashboard-stats'
import RecentTransactions from './recent-transactions'
import FinancialChart from './financial-chart'
import PaymentMethodCharts from './payment-method-charts'
import CategoryTrendsChart from './category-trends-chart'
import IncomeTrendsChart from './income-trends-chart'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    refetch,
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

      {/* Seção de visão financeira reorganizada */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Primeira metade - Gráfico + Transações Recentes */}
        <div className="space-y-4">
          <FinancialChart data={chartData} />
          
          {/* Transações recentes com scroll */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                {dashboardData.recentTransactions.slice(0, 10).map((transaction: {
                  id: string;
                  description: string;
                  amount: number;
                  type: 'INCOME' | 'EXPENSE';
                  category?: {
                    name: string;
                    color: string;
                  };
                }) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: transaction.category?.color || '#gray' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category?.name}</p>
                      </div>
                    </div>
                    <span className={`font-semibold whitespace-nowrap ${
                      transaction.type === 'INCOME' ? 'text-income' : 'text-expense'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(transaction.amount)}
                    </span>
                  </div>
                ))}
                {dashboardData.recentTransactions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma transação recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda metade - Gastos por categoria */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Gastos por categoria atual */}
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-y-auto h-auto pr-2">
                {dashboardData.expensesByCategory.length > 0 ? (
                  dashboardData.expensesByCategory.map((category: {
                    categoryId: string;
                    categoryColor: string;
                    categoryName: string;
                    amount: number;
                  }) => (
                    <div key={category.categoryId} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.categoryColor }}
                        />
                        <span className="font-medium">{category.categoryName}</span>
                      </div>
                      <span className="text-lg font-semibold text-expense whitespace-nowrap">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(category.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma despesa este mês
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de métodos de pagamento */}
          <PaymentMethodCharts
            expenseData={dashboardData.expensesByPaymentMethod || []}
            incomeData={dashboardData.incomeByPaymentMethod || []}
          />
        </div>
      </div>

      {/* Seção de tendências - lado a lado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tendências de Despesas */}
        <CategoryTrendsChart 
          data={dashboardData.categoryTrends || { chartData: [], categories: [] }} 
        />
        
        {/* Tendências de Receitas */}
        <IncomeTrendsChart 
          data={dashboardData.incomeTrends || { chartData: [], categories: [] }} 
          title="Tendências de Receitas por Categoria"
        />
      </div>
    </div>
  )
}