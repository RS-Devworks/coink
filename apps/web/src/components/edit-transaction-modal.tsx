'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea" // Para futuras funcionalidades
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
// import { ptBR } from "date-fns/locale" // Para futuras funcionalidades
import { cn } from "@/lib/utils"
import { TransactionType, PaymentMethod, CreateTransactionRequest, Category, Transaction } from '@/@types/transaction'
import CurrencyInput from '@/components/ui/currency-input'
import { editTransaction } from '@/server/actions/transactions'
import { toast } from 'sonner'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['INCOME', 'EXPENSE']),
  paymentMethod: z.enum(['CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'PIX', 'BANK_TRANSFER', 'CHECK', 'BOLETO', 'LOAN']),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  date: z.date({ message: "Data é obrigatória" }),
  dueDate: z.date().optional(),
  isPaid: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().min(1).max(31).optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const paymentMethodLabels = {
  CASH: 'Dinheiro',
  DEBIT_CARD: 'Cartão de Débito',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência Bancária',
  CHECK: 'Cheque',
  BOLETO: 'Boleto',
  LOAN: 'Empréstimo'
}

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
  onTransactionUpdated: () => void
}

export default function EditTransactionModal({ open, onOpenChange, transaction, onTransactionUpdated }: EditTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [date, setDate] = useState<Date>(new Date(transaction.date))
  const [dueDate, setDueDate] = useState<Date | undefined>(transaction.dueDate ? new Date(transaction.dueDate) : undefined)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type as TransactionType,
      paymentMethod: transaction.paymentMethod as PaymentMethod,
      categoryId: transaction.categoryId,
      date: new Date(transaction.date),
      dueDate: transaction.dueDate ? new Date(transaction.dueDate) : undefined,
      isPaid: transaction.isPaid,
      isRecurring: transaction.isRecurring,
      recurringDay: transaction.recurringDay || undefined,
    }
  })

  const watchedType = watch('type')
  
  // Buscar categorias da API
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true)
      try {
        const { getCategories } = await import('@/server/actions/categories')
        const result = await getCategories()
        if (result.success) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    
    if (open) {
      loadCategories()
    }
  }, [open])

  // Filtrar categorias baseado no tipo
  const filteredCategories = categories.filter(cat => 
    cat.type === watchedType
  )

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    
    try {
      const transactionData: Partial<CreateTransactionRequest> = {
        description: data.description,
        amount: data.amount,
        type: data.type as TransactionType,
        paymentMethod: data.paymentMethod as PaymentMethod,
        categoryId: data.categoryId,
        date: data.date,
        dueDate: data.dueDate,
        isPaid: data.isPaid,
        isRecurring: data.isRecurring,
        recurringDay: data.recurringDay,
      }

      const result = await editTransaction(transaction.id, transactionData)
      
      if (result.success) {
        toast.success('Transação atualizada com sucesso!')
        onTransactionUpdated()
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Erro ao editar transação:', error)
      toast.error('Erro ao editar transação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Edite os dados da transação
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição*</Label>
            <Input
              id="description"
              placeholder="Ex: Compra no supermercado"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor*</Label>
              <CurrencyInput
                id="amount"
                placeholder="R$ 0,00"
                value={transaction.amount}
                onChange={(value) => setValue('amount', value)}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo*</Label>
              <Select 
                defaultValue={transaction.type}
                onValueChange={(value) => setValue('type', value as TransactionType)} 
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Método de Pagamento*</Label>
            <Select 
              defaultValue={transaction.paymentMethod}
              onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)} 
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar método" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categoria*</Label>
            <Select 
              defaultValue={transaction.categoryId}
              onValueChange={(value) => setValue('categoryId', value)} 
              disabled={isLoading || categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  categoriesLoading ? "Carregando..." : 
                  !watchedType ? "Primeiro selecione o tipo" :
                  filteredCategories.length === 0 ? "Nenhuma categoria encontrada" :
                  "Selecionar categoria"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color || '#gray' }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate!)
                      setValue('date', selectedDate!)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy") : "Vencimento"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(selectedDate) => {
                      setDueDate(selectedDate)
                      setValue('dueDate', selectedDate)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}