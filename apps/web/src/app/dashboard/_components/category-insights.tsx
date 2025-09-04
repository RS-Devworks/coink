import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PaymentMethodCharts from './payment-method-charts'

interface CategoryInsightsProps {
  expensesByCategory: Array<{
    categoryId: string
    categoryColor: string
    categoryName: string
    amount: number
  }>
  expensesByPaymentMethod: Array<{
    paymentMethod: string
    amount: number
    color: string
  }>
  incomeByPaymentMethod: Array<{
    paymentMethod: string
    amount: number
    color: string
  }>
}

const CategoryInsights = memo(function CategoryInsights({ 
  expensesByCategory,
  expensesByPaymentMethod,
  incomeByPaymentMethod 
}: CategoryInsightsProps) {
  return (
    <div className="space-y-4 flex flex-col justify-between">
      {/* Gastos por categoria atual */}
      <Card className="h-[360px] overflow-y-auto">
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 overflow-y-auto h-auto pr-2">
            {expensesByCategory.length > 0 ? (
              expensesByCategory.map((category) => (
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
        expenseData={expensesByPaymentMethod}
        incomeData={incomeByPaymentMethod}
      />
    </div>
  )
})

export default CategoryInsights
