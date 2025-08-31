'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", receitas: 4200, despesas: 3800 },
  { month: "Fev", receitas: 3800, despesas: 3200 },
  { month: "Mar", receitas: 5200, despesas: 4100 },
  { month: "Abr", receitas: 4800, despesas: 3600 },
  { month: "Mai", receitas: 5600, despesas: 4200 },
  { month: "Jun", receitas: 5240, despesas: 3180 }
]

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "var(--color-green-600)",
  },
  despesas: {
    label: "Despesas", 
    color: "var(--color-red-600)",
  },
} satisfies ChartConfig

export default function FinancialChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Visão Financeira</CardTitle>
        <CardDescription>
          Comparação de receitas e despesas dos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
            <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}