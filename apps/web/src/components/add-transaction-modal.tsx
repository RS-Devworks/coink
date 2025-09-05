'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea" // Para futuras funcionalidades
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, PlusCircle, CreditCard } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
// import { ptBR } from "date-fns/locale" // Para futuras funcionalidades
import { cn } from "@/lib/utils"
import { TransactionType, PaymentMethod, CreateTransactionRequest, Category } from '@/@types/transaction'
import CurrencyInput from '@/components/ui/currency-input'
import CreateCategoryDialog from '@/components/create-category-dialog'
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
  isInstallment: z.boolean().default(false),
  totalInstallments: z.number().min(2).max(60).optional(),
  interestRate: z.number().min(0).max(100).optional(),
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

interface AddTransactionModalProps {
  trigger?: React.ReactNode
}

export default function AddTransactionModal({ trigger }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [date, setDate] = useState<Date>()
  const [dueDate, setDueDate] = useState<Date>()
  const [showCreateCategory, setShowCreateCategory] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      isPaid: true,
      isRecurring: false,
      isInstallment: false,
    }
  })

  const watchedType = watch('type')
  const watchedPaymentMethod = watch('paymentMethod')
  const watchedIsInstallment = watch('isInstallment')
  const watchedIsRecurring = watch('isRecurring')
  
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

  const canBeInstallment = ['CREDIT_CARD', 'BOLETO'].includes(watchedPaymentMethod)
  
  // Filtrar categorias baseado no tipo
  const filteredCategories = categories.filter(cat => 
    cat.type === watchedType
  )

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory])
    setValue('categoryId', newCategory.id)
  }

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    
    try {
      const { createTransaction } = await import('@/server/actions/transactions')
      let result
      
      if (data.isInstallment && data.totalInstallments) {
        // Criar transação parcelada via endpoint regular
        const transactionData: CreateTransactionRequest = {
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
          isInstallment: true,
          totalInstallments: data.totalInstallments,
          interestRate: data.interestRate
        }
        result = await createTransaction(transactionData)
      } else {
        // Criar transação simples
        const transactionData: CreateTransactionRequest = {
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
          interestRate: data.interestRate
        }
        result = await createTransaction(transactionData)
      }
      
      if (result.success) {
        reset()
        setDate(undefined)
        setDueDate(undefined)
        setOpen(false)
        // Disparar evento personalizado para atualizar a tabela
        window.dispatchEvent(new CustomEvent('transactionAdded'))
        toast.success('Transação criada com sucesso!')
      } else {
        console.error('Erro ao criar transação:', result.error)
        toast.error(result.error || 'Erro ao criar transação')
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      toast.error('Erro ao criar transação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa para acompanhar suas finanças
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                onChange={(value) => setValue('amount', value)}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo*</Label>
              <Select onValueChange={(value) => setValue('type', value as TransactionType)} disabled={isLoading}>
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
            <Select onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar método" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {value === 'CREDIT_CARD' && <CreditCard className="h-4 w-4" />}
                      {label}
                    </div>
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
            <Select onValueChange={(value) => {
              if (value === 'CREATE_NEW') {
                setShowCreateCategory(true)
              } else {
                setValue('categoryId', value)
              }
            }} disabled={isLoading || categoriesLoading}>
              <SelectTrigger>
                <SelectValue placeholder={
                  categoriesLoading ? "Carregando..." : 
                  !watchedType ? "Primeiro selecione o tipo" :
                  filteredCategories.length === 0 ? "Nenhuma categoria encontrada" :
                  "Selecionar categoria"
                } />
              </SelectTrigger>
              <SelectContent>
                {watchedType && (
                  <>
                    <SelectItem value="CREATE_NEW">
                      <div className="flex items-center gap-2 text-blue-600">
                        <PlusCircle className="w-3 h-3" />
                        Criar Nova Categoria
                      </div>
                    </SelectItem>
                    {filteredCategories.length > 0 && <div className="border-t my-1" />}
                  </>
                )}
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
                      setDate(selectedDate)
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

          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(value) => setValue('isPaid', value === 'true')} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Pago</SelectItem>
                <SelectItem value="false">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canBeInstallment && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="installment"
                  checked={watchedIsInstallment}
                  onCheckedChange={(checked) => setValue('isInstallment', checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="installment" className="font-medium">
                  Parcelar {watchedPaymentMethod === 'CREDIT_CARD' ? 'no cartão' : 'boleto'}
                </Label>
              </div>

              {watchedIsInstallment && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas*</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="60"
                      placeholder="12"
                      {...register('totalInstallments', { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                    {errors.totalInstallments && (
                      <p className="text-sm text-destructive">{errors.totalInstallments.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest">Juros (%)</Label>
                    <Input
                      id="interest"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="2.5"
                      {...register('interestRate', { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={watchedIsRecurring}
                onCheckedChange={(checked) => setValue('isRecurring', checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="recurring" className="font-medium">
                Transação Recorrente (ex: Assinaturas)
              </Label>
            </div>

            {watchedIsRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurringDay">Dia do mês*</Label>
                  <Input
                    id="recurringDay"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="5"
                    {...register('recurringDay', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.recurringDay && (
                    <p className="text-sm text-destructive">{errors.recurringDay.message}</p>
                  )}
                </div>

              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                watchedType === 'INCOME' && 'bg-green-600 hover:bg-green-700',
                watchedType === 'EXPENSE' && 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Transação'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Diálogo para criar nova categoria */}
      <CreateCategoryDialog
        open={showCreateCategory}
        onOpenChange={setShowCreateCategory}
        type={watchedType === 'INCOME' || watchedType === 'EXPENSE' ? watchedType as TransactionType : undefined}
        onCategoryCreated={handleCategoryCreated}
      />
    </Dialog>
  )
}