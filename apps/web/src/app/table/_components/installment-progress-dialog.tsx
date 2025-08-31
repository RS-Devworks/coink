'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Transaction } from '@/@types/transaction'
import { getInstallmentGroup, markInstallmentAsPaid } from '@/server/actions/transactions'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from 'sonner'
import { Loader2, Calendar, CreditCard, DollarSign } from 'lucide-react'

interface InstallmentProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  onUpdate?: () => void
}

export default function InstallmentProgressDialog({ 
  open, 
  onOpenChange, 
  groupId, 
  onUpdate 
}: InstallmentProgressDialogProps) {
  const [installments, setInstallments] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (open && groupId) {
      loadInstallments()
    }
  }, [open, groupId])

  const loadInstallments = async () => {
    setLoading(true)
    try {
      const result = await getInstallmentGroup(groupId)
      if (result.success) {
        // result.data pode ter uma estrutura diferente, vamos verificar
        const transactions = result.data.transactions || result.data
        if (Array.isArray(transactions)) {
          // Ordenar por número da parcela
          const sortedInstallments = transactions.sort((a: Transaction, b: Transaction) => 
            (a.installmentNum || 0) - (b.installmentNum || 0)
          )
          setInstallments(sortedInstallments)
        } else {
          console.error('Transactions data is not an array:', result.data)
          setInstallments([])
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error)
      toast.error('Erro ao carregar parcelas')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePaid = async (installmentId: string, isPaid: boolean) => {
    setUpdating(installmentId)
    try {
      const result = await markInstallmentAsPaid(installmentId, isPaid)
      if (result.success) {
        // Atualizar estado local
        setInstallments(prev => 
          prev.map(inst => 
            inst.id === installmentId 
              ? { ...inst, isPaid } 
              : inst
          )
        )
        toast.success(isPaid ? 'Parcela marcada como paga' : 'Pagamento desmarcado')
        onUpdate?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error)
      toast.error('Erro ao atualizar parcela')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Carregando Parcelas...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!installments.length) {
    return null
  }

  const firstInstallment = installments[0]
  const paidCount = installments.filter(i => i.isPaid).length
  const totalCount = installments.length
  const progressPercentage = (paidCount / totalCount) * 100
  const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0)
  const paidAmount = installments.filter(i => i.isPaid).reduce((sum, inst) => sum + inst.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {firstInstallment.description.replace(/ \(\d+\/\d+\)$/, '')}
          </DialogTitle>
          <DialogDescription>
            Acompanhe o progresso e pagamento das parcelas
          </DialogDescription>
        </DialogHeader>

        {/* Resumo do parcelamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {paidCount}/{totalCount}
            </div>
            <div className="text-sm text-muted-foreground">Parcelas Pagas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">Valor Pago</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Lista de parcelas */}
        <div className="space-y-2">
          <h4 className="font-medium">Parcelas</h4>
          <div className="space-y-1">
            {installments.map((installment) => (
              <div 
                key={installment.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  installment.isPaid ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={installment.isPaid}
                    onCheckedChange={(checked) => 
                      handleTogglePaid(installment.id, checked as boolean)
                    }
                    disabled={updating === installment.id}
                  />
                  <div>
                    <div className="font-medium">
                      {installment.installmentNum}/{installment.totalInstallments}ª Parcela
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {installment.dueDate 
                        ? format(new Date(installment.dueDate), "dd/MM/yyyy", { locale: ptBR })
                        : format(new Date(installment.date), "dd/MM/yyyy", { locale: ptBR })
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold">
                      R$ {installment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {installment.interestRate && (
                      <div className="text-xs text-muted-foreground">
                        Juros: {installment.interestRate}%
                      </div>
                    )}
                  </div>
                  <Badge variant={installment.isPaid ? "default" : "secondary"}>
                    {installment.isPaid ? "Paga" : "Pendente"}
                  </Badge>
                  {updating === installment.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}