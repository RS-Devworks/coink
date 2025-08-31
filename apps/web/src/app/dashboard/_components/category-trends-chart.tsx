'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, Legend } from "recharts"

interface CategoryTrendsData {
  chartData: Record<string, number | string>[]
  categories: { id: string; name: string; color: string }[]
}

interface CategoryTrendsChartProps {
  data: CategoryTrendsData
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-lg shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value)
          .map((entry, index: number) => (
            <p key={index} className="text-sm">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.dataKey}:</span>
              <span className="ml-2 text-expense font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
      </div>
    )
  }
  return null
}

export default function CategoryTrendsChart({ data }: CategoryTrendsChartProps) {
  if (!data.chartData.length || !data.categories.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendências por Categoria</CardTitle>
          <CardDescription>
            Evolução dos gastos por categoria nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          <div className="text-center">
            <p>Nenhum dado disponível</p>
            <p className="text-sm">para exibir tendências</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Gerar configuração para o gráfico baseado nas categorias
  const chartConfig: ChartConfig = {}
  data.categories.forEach((category) => {
    chartConfig[category.name] = {
      label: category.name,
      color: category.color,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências por Categoria</CardTitle>
        <CardDescription>
          Evolução dos gastos por categoria nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <LineChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {data.categories.map((category) => (
              <Line
                key={category.id}
                type="monotone"
                dataKey={category.name}
                stroke={category.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
        
        {/* Resumo das tendências */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3 text-sm">Resumo das Tendências:</h4>
          <div className="grid gap-2">
            {data.categories.map((category) => {
              const categoryData = data.chartData.map(month => {
                const value = month[category.name];
                return typeof value === 'number' ? value : 0;
              });
              const firstValue: number = categoryData.find(v => v > 0) || 0;
              const lastValue: number = categoryData[categoryData.length - 1] || 0;
              const trend = lastValue > firstValue ? 'increase' : lastValue < firstValue ? 'decrease' : 'stable';
              const change = lastValue - firstValue;
              
              if (lastValue === 0 && firstValue === 0) return null;
              
              return (
                <div key={category.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={
                      trend === 'increase' ? 'text-expense' :
                      trend === 'decrease' ? 'text-income' :
                      'text-muted-foreground'
                    }>
                      {trend === 'increase' && '↗'}
                      {trend === 'decrease' && '↘'}
                      {trend === 'stable' && '→'}
                      {change !== 0 && (
                        <span className="ml-1">
                          {formatCurrency(Math.abs(change))}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}