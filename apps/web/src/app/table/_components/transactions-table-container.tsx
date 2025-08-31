'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './data-table'
import { Transaction, TransactionFilterParams, TransactionType } from '@/@types/transaction'
import { getTableData } from '@/server/actions/transactions'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TransactionsTableContainer() {
  const currentDate = new Date()
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    limit: 20,
    month: currentDate.getMonth() + 1, // Mês atual
    year: currentDate.getFullYear(), // Ano atual
  })

  const {
    data: tableData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions-table', filters],
    queryFn: async () => {
      const result = await getTableData(filters)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar transações')
    }
  }, [error])

  // Listener para evento de transação adicionada
  useEffect(() => {
    const handleTransactionAdded = () => {
      refetch()
    }

    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [refetch])

  // Todos os meses disponíveis
  const allMonths = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]
  
  // Usar todos os meses (permitindo transações futuras e passadas)
  const months = allMonths

  // Gerar opções de anos mais amplas (últimos 3 anos e próximos 2)
  const currentYear = currentDate.getFullYear()
  const years = [
    currentYear - 2,
    currentYear - 1, 
    currentYear,
    currentYear + 1,
    currentYear + 2
  ]

  const handleMonthChange = (month: string) => {
    const selectedMonth = parseInt(month)
    setFilters(prev => ({ 
      ...prev, 
      month: selectedMonth, 
      year: prev.year || currentYear, // Manter o ano atual se não tiver selecionado
      page: 1 
    }))
  }

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year: parseInt(year), page: 1 }))
  }

  const handleTypeChange = (type: string) => {
    if (type === 'ALL') {
      setFilters(prev => ({ ...prev, type: undefined, page: 1 }))
    } else {
      setFilters(prev => ({ ...prev, type: type as TransactionType, page: 1 }))
    }
  }

  const handleViewAllToggle = () => {
    if (filters.month && filters.year) {
      // Está filtrando por mês, mudar para "ver todas"
      setFilters(prev => ({ ...prev, month: undefined, year: undefined, page: 1 }))
    } else {
      // Está vendo todas, voltar para mês atual
      setFilters(prev => ({ 
        ...prev, 
        month: currentDate.getMonth() + 1, 
        year: currentDate.getFullYear(),
        page: 1 
      }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted-foreground">
            Gerencie suas transações financeiras
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Primeira linha - Período e Tipo */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Período:</span>
                <Button
                  variant={filters.month && filters.year ? "outline" : "default"}
                  size="sm"
                  onClick={handleViewAllToggle}
                >
                  {filters.month && filters.year ? "Ver Todas" : "Filtrar por Mês"}
                </Button>
                
                {filters.month && filters.year && (
                  <>
                    <Select 
                      value={filters.month?.toString()} 
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={filters.year?.toString()} 
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tipo:</span>
                <Select 
                  value={filters.type || 'ALL'} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="INCOME">Receitas</SelectItem>
                    <SelectItem value="EXPENSE">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {tableData?.meta && (
                <div className="text-sm text-muted-foreground ml-auto">
                  {tableData.meta.total} transações encontradas
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable 
        data={tableData?.data || []} 
        loading={isLoading}
      />

      {tableData?.meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {Math.min(tableData.meta.limit, tableData.data.length)} de{' '}
            {tableData.meta.total} transações
          </span>
          <span>
            Página {tableData.meta.page} de {tableData.meta.totalPages}
          </span>
        </div>
      )}

      {/* Resumo Financeiro */}
      {tableData?.summary && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-green-800">Total de Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((tableData.summary as any).totalIncome)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-red-800">Total de Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((tableData.summary as any).totalExpense)}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                (tableData.summary as any).balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <div>
                  <p className={`text-sm font-medium ${
                    (tableData.summary as any).balance >= 0 ? 'text-blue-800' : 'text-orange-800'
                  }`}>Balanço</p>
                  <p className={`text-2xl font-bold ${
                    (tableData.summary as any).balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((tableData.summary as any).balance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}