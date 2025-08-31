import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Clock } from "lucide-react"
import Link from "next/link"
import { Transaction } from "@/@types/transaction"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecentTransactionsProps {
  transactions: Transaction[]
  upcomingInstallments: Transaction[]
}

export default function RecentTransactions({ transactions, upcomingInstallments }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  return (
    <div className="space-y-4">
      {/* Transações Recentes */}
      <Card>
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
            {transactions.length > 0 ? transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: transaction.category.color || '#gray' }}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category.name}
                      </Badge>
                      {(transaction as any).installmentInfo && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          {(transaction as any).installmentInfo}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'INCOME' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma transação recente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Parcelas */}
      {upcomingInstallments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <CardTitle>Próximas Parcelas</CardTitle>
                <CardDescription>
                  Vencendo nos próximos 30 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInstallments.slice(0, 3).map((installment) => (
                <div key={installment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: installment.category.color || '#gray' }}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {installment.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-yellow-600">
                          {installment.installmentNum}/{installment.totalInstallments}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Venc: {installment.dueDate && format(new Date(installment.dueDate), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-yellow-600">
                    {formatCurrency(installment.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}