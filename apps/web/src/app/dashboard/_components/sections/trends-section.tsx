import { memo } from 'react'
import CategoryTrendsChart from '../charts/category-trends-chart'
import IncomeTrendsChart from '../charts/income-trends-chart'

interface TrendsSectionProps {
  categoryTrends: {
    chartData: any[]
    categories: any[]
  }
  incomeTrends: {
    chartData: any[]
    categories: any[]
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
