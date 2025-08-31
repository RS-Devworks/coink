'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './data-table'
import { Transaction, TransactionFilterParams } from '@/@types/transaction'
import { getTableData } from '@/server/actions/transactions'
import { toast } from 'sonner'

export default function TransactionsTableContainer() {
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    limit: 20,
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
    </div>
  )
}