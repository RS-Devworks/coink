import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle } from "lucide-react"

interface DashboardStatsProps {
  income: number
  expense: number
  balance: number
  transactionsCount: number
  pendingCount: number
}

export default function DashboardStats({ 
  income, 
  expense, 
  balance, 
  transactionsCount, 
  pendingCount 
}: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const stats = [
    {
      title: "Receitas do Mês",
      value: formatCurrency(income),
      description: "Total de entradas",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Despesas do Mês", 
      value: formatCurrency(expense),
      description: "Total de saídas",
      icon: TrendingDown,
      trend: "down"
    },
    {
      title: "Saldo do Mês",
      value: formatCurrency(balance),
      description: balance >= 0 ? "Saldo positivo" : "Saldo negativo",
      icon: DollarSign,
      trend: balance >= 0 ? "up" : "down"
    },
    {
      title: "Total de Transações",
      value: transactionsCount.toString(),
      description: "Todas as transações",
      icon: CreditCard,
      trend: "neutral"
    },
    {
      title: "Parcelas Pendentes",
      value: pendingCount.toString(),
      description: "Aguardando pagamento",
      icon: AlertCircle,
      trend: pendingCount > 0 ? "warning" : "neutral"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${
              stat.trend === 'up' ? 'text-income' : 
              stat.trend === 'down' ? 'text-expense' :
              stat.trend === 'warning' ? 'text-warning' :
              'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stat.trend === 'up' ? 'text-income' :
              stat.trend === 'down' && stat.title.includes('Saldo') ? 'text-expense' :
              ''
            }`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}