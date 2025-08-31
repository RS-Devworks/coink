'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts"

const paymentMethodLabels = {
  CASH: 'Dinheiro',
  DEBIT_CARD: 'Cartão Débito', 
  CREDIT_CARD: 'Cartão Crédito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência',
  CHECK: 'Cheque',
  BOLETO: 'Boleto',
  LOAN: 'Empréstimo'
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
]

interface PaymentMethodData {
  paymentMethod: string
  amount: number
}

interface PaymentMethodChartsProps {
  expenseData: PaymentMethodData[]
  incomeData: PaymentMethodData[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{paymentMethodLabels[data.paymentMethod as keyof typeof paymentMethodLabels]}</p>
        <p className="text-sm">
          <span className="font-medium text-green-600">{formatCurrency(data.amount)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {data.percentage}% do total
        </p>
      </div>
    )
  }
  return null
}

const prepareChartData = (data: PaymentMethodData[]) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  return data
    .filter(item => item.amount > 0)
    .map((item, index) => ({
      ...item,
      name: paymentMethodLabels[item.paymentMethod as keyof typeof paymentMethodLabels],
      fill: COLORS[index % COLORS.length],
      percentage: ((item.amount / total) * 100).toFixed(1)
    }))
}

export default function PaymentMethodCharts({ expenseData, incomeData }: PaymentMethodChartsProps) {
  const expenseChartData = prepareChartData(expenseData)
  const incomeChartData = prepareChartData(incomeData)

  const expenseTotal = expenseData.reduce((sum, item) => sum + item.amount, 0)
  const incomeTotal = incomeData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Método</CardTitle>
          <CardDescription>
            Distribuição dos gastos por método de pagamento
          </CardDescription>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(expenseTotal)}
          </div>
        </CardHeader>
        <CardContent>
          {expenseChartData.length > 0 ? (
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ percentage }) => `${percentage}%`}
                  labelLine={false}
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-sm">{value}</span>}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <p>Nenhum gasto registrado</p>
                <p className="text-sm">neste mês</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receitas por Método</CardTitle>
          <CardDescription>
            Distribuição das receitas por método de recebimento
          </CardDescription>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(incomeTotal)}
          </div>
        </CardHeader>
        <CardContent>
          {incomeChartData.length > 0 ? (
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ percentage }) => `${percentage}%`}
                  labelLine={false}
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-sm">{value}</span>}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <p>Nenhuma receita registrada</p>
                <p className="text-sm">neste mês</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}