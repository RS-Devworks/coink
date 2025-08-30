import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default function DashboardStats() {
  const stats = [
    {
      title: "Receitas",
      value: "R$ 5.240,00",
      description: "+12% em relação ao mês passado",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Despesas", 
      value: "R$ 3.180,00",
      description: "-8% em relação ao mês passado",
      icon: TrendingDown,
      trend: "down"
    },
    {
      title: "Saldo Total",
      value: "R$ 2.060,00",
      description: "Saldo disponível atual",
      icon: DollarSign,
      trend: "neutral"
    }
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${
              stat.trend === 'up' ? 'text-green-600' : 
              stat.trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}