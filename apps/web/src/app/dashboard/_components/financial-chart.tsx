'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
  },
  despesas: {
    label: "Despesas", 
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface FinancialChartProps {
  data: Array<{
    name: string
    receitas: number
    despesas: number
  }>
}

export default function FinancialChart({ data }: FinancialChartProps) {
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
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="name"
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