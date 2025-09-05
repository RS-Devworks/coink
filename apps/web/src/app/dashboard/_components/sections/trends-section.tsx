import { memo } from 'react'
import CategoryTrendsChart from '../charts/category-trends-chart'
import IncomeTrendsChart from '../charts/income-trends-chart'

interface ChartDataPoint extends Record<string, string | number> {
  name: string
  value: number
}

interface CategoryData {
  id: string
  name: string
  color: string
}

interface TrendsSectionProps {
  categoryTrends: {
    chartData: ChartDataPoint[]
    categories: CategoryData[]
  }
  incomeTrends: {
    chartData: ChartDataPoint[]
    categories: CategoryData[]
  }
}

const TrendsSection = memo(function TrendsSection({ 
  categoryTrends, 
  incomeTrends 
}: TrendsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Tendências de Despesas */}
      <CategoryTrendsChart data={categoryTrends} />
      
      {/* Tendências de Receitas */}
      <IncomeTrendsChart 
        data={incomeTrends}
        title="Tendências de Receitas por Categoria"
      />
    </div>
  )
})

export default TrendsSection
