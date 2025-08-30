import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

const recentTransactions = [
  {
    id: "1",
    title: "Salário",
    category: "Trabalho",
    amount: 4800,
    type: "INCOME" as const,
    date: "2024-01-15"
  },
  {
    id: "2", 
    title: "Supermercado",
    category: "Alimentação",
    amount: -280,
    type: "EXPENSE" as const,
    date: "2024-01-14"
  },
  {
    id: "3",
    title: "Netflix",
    category: "Entretenimento", 
    amount: -39.90,
    type: "EXPENSE" as const,
    date: "2024-01-13"
  },
  {
    id: "4",
    title: "Freelance",
    category: "Trabalho",
    amount: 800,
    type: "INCOME" as const,
    date: "2024-01-12"
  },
  {
    id: "5",
    title: "Combustível",
    category: "Transporte",
    amount: -120,
    type: "EXPENSE" as const,
    date: "2024-01-11"
  }
]

export default function RecentTransactions() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Suas últimas movimentações financeiras
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/table">
              Ver todas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.title}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${
                transaction.type === 'INCOME' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.type === 'INCOME' ? '+' : ''}
                R$ {Math.abs(transaction.amount).toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}