import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FinancialChart from '../charts/financial-chart'

interface FinancialOverviewProps {
  chartData: Array<{
    name: string
    receitas: number
    despesas: number
  }>
  recentTransactions: Array<{
    id: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category?: {
      name: string
      color: string
    }
  }>
}

const FinancialOverview = memo(function FinancialOverview({ 
  chartData, 
  recentTransactions 
}: FinancialOverviewProps) {
  return (
    <div className="space-y-4">
      <FinancialChart data={chartData} />
      
      {/* Transações recentes com scroll */}
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
            {recentTransactions.slice(0, 10).map((transaction) => (
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
            {recentTransactions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma transação recente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default FinancialOverview
