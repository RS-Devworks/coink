"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { Transaction, PaymentMethod, TransactionType } from "@/@types/transaction"
import { deleteTransaction, deleteInstallmentGroup, markInstallmentAsPaid } from '@/server/actions/transactions'
import { toast } from 'sonner'
import InstallmentProgressDialog from './installment-progress-dialog'
import EditTransactionModal from '@/components/edit-transaction-modal'

// Mapeamento de colunas para nomes em português
const columnLabels: Record<string, string> = {
  description: 'Descrição',
  amount: 'Valor',
  type: 'Tipo',
  paymentMethod: 'Método de Pagamento',
  date: 'Data',
  category: 'Categoria',
  isPaid: 'Status'
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  DEBIT_CARD: 'Cartão Débito',
  CREDIT_CARD: 'Cartão Crédito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência',
  CHECK: 'Cheque',
  BOLETO: 'Boleto',
  LOAN: 'Empréstimo'
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: row.original.category.color || '#gray' }}
        />
        <div>
          <div className="font-medium">{row.original.description}</div>
          {row.original.isInstallment && (
            <div className="text-sm text-muted-foreground">
              Parcela {row.original.installmentNum}/{row.original.totalInstallments}
            </div>
          )}
          {row.original.isRecurring && (
            <Badge variant="outline" className="text-xs">
              Recorrente
            </Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoria
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.category.name}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Método
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="text-sm">
        {paymentMethodLabels[row.original.paymentMethod]}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right"
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const isIncome = row.original.type === TransactionType.INCOME

      return (
        <div className={`text-right font-medium ${
          isIncome ? 'text-green-600' : 'text-red-600'
        }`}>
          {isIncome ? '+' : '-'}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div>{format(new Date(row.original.date), "dd/MM/yyyy", { locale: ptBR })}</div>
        {row.original.dueDate && (
          <div className="text-xs text-muted-foreground">
            Venc: {format(new Date(row.original.dueDate), "dd/MM", { locale: ptBR })}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isPaid",
    header: "Status",
    cell: ({ row }) => {
      const isPaid = row.original.isPaid
      return (
        <Badge variant={isPaid ? "default" : "destructive"}>
          {isPaid ? "Pago" : "Pendente"}
        </Badge>
      )
    },
  },
]

// Separar as colunas e a função de ações para ter acesso ao estado do componente
const createActionsColumn = (
  onShowInstallments: (groupId: string) => void,
  onEditTransaction: (transaction: Transaction) => void
) => ({
  id: "actions",
  enableHiding: false,
  cell: ({ row }: { row: any }) => {
    const transaction = row.original as Transaction

    const handleMarkAsPaid = async () => {
      try {
        const newStatus = !transaction.isPaid
        const result = await markInstallmentAsPaid(transaction.id, newStatus)
        if (result.success) {
          toast.success(`Transação marcada como ${newStatus ? 'paga' : 'não paga'}`)
          window.location.reload() // Recarregar dados
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        toast.error('Erro ao atualizar status')
      }
    }

    const handleDelete = async () => {
        try {
          if (transaction.isInstallment && transaction.installmentGroupId) {
            // Confirmar exclusão de todas as parcelas
            if (confirm(`Deseja excluir todas as parcelas deste parcelamento? Esta ação não pode ser desfeita.`)) {
              const result = await deleteInstallmentGroup(transaction.installmentGroupId)
              if (result.success) {
                toast.success('Parcelamento excluído com sucesso')
                window.location.reload() // Recarregar dados
              } else {
                toast.error(result.error)
              }
            }
          } else {
            // Confirmar exclusão de transação simples
            if (confirm('Deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
              const result = await deleteTransaction(transaction.id)
              if (result.success) {
                toast.success('Transação excluída com sucesso')
                window.location.reload() // Recarregar dados
              } else {
                toast.error(result.error)
              }
            }
          }
        } catch (error) {
          console.error('Erro ao excluir:', error)
          toast.error('Erro ao excluir transação')
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleMarkAsPaid}>
              {transaction.isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            {transaction.isInstallment && transaction.installmentGroupId && (
              <DropdownMenuItem onClick={() => onShowInstallments(transaction.installmentGroupId!)}>
                Ver parcelas
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
            >
              {transaction.isInstallment ? 'Excluir Parcelamento' : 'Excluir'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
})

interface DataTableProps {
  data: Transaction[]
  loading?: boolean
}

export function DataTable({ data, loading }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [installmentDialog, setInstallmentDialog] = useState<{ open: boolean; groupId: string }>({
    open: false,
    groupId: ''
  })
  const [editDialog, setEditDialog] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null
  })

  const handleShowInstallments = (groupId: string) => {
    setInstallmentDialog({ open: true, groupId })
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditDialog({ open: true, transaction })
  }

  const allColumns = [...columns, createActionsColumn(handleShowInstallments, handleEditTransaction)]

  const table = useReactTable({
    data,
    columns: allColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton para filtros */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-80 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
        </div>
        
        {/* Skeleton para tabela */}
        <div className="border rounded-md">
          <div className="h-12 bg-muted border-b animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b animate-pulse" />
          ))}
        </div>

        {/* Skeleton para paginação */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const handleBulkMarkAsPaid = async (isPaid: boolean) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('Selecione pelo menos uma transação')
      return
    }

    try {
      const promises = selectedRows.map(row => {
        const transaction = row.original as Transaction
        return markInstallmentAsPaid(transaction.id, isPaid)
      })

      await Promise.all(promises)
      toast.success(`${selectedRows.length} transação(ões) marcada(s) como ${isPaid ? 'paga(s)' : 'não paga(s)'}`)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar transações:', error)
      toast.error('Erro ao atualizar transações')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar transações..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex gap-2 ml-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkMarkAsPaid(true)}
            >
              Marcar como pago ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkMarkAsPaid(false)}
            >
              Marcar como não pago ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Diálogo de progresso das parcelas */}
      <InstallmentProgressDialog
        open={installmentDialog.open}
        onOpenChange={(open) => setInstallmentDialog(prev => ({ ...prev, open }))}
        groupId={installmentDialog.groupId}
        onUpdate={() => {
          // Recarregar dados quando uma parcela for atualizada
          window.location.reload()
        }}
      />

      {/* Modal de edição de transação */}
      {editDialog.transaction && (
        <EditTransactionModal
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}
          transaction={editDialog.transaction}
          onTransactionUpdated={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}