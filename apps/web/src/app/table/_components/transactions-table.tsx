'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Filter } from "lucide-react"
import { TransactionType } from '@/@types/transaction'
import AddTransactionModal from '@/components/add-transaction-modal'

const mockTransactions = [
  {
    id: "1",
    title: "Salário Janeiro",
    description: "Salário mensal da empresa",
    amount: 4800,
    type: "INCOME" as TransactionType,
    category: "Trabalho",
    date: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    userId: "user1"
  },
  {
    id: "2",
    title: "Supermercado Extra",
    description: "Compras mensais",
    amount: 280,
    type: "EXPENSE" as TransactionType,
    category: "Alimentação",
    date: new Date("2024-01-14"),
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    userId: "user1"
  },
  {
    id: "3",
    title: "Netflix",
    description: "Assinatura mensal",
    amount: 39.90,
    type: "EXPENSE" as TransactionType,
    category: "Entretenimento",
    date: new Date("2024-01-13"),
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
    userId: "user1"
  },
  {
    id: "4",
    title: "Freelance Design",
    description: "Projeto de identidade visual",
    amount: 800,
    type: "INCOME" as TransactionType,
    category: "Trabalho",
    date: new Date("2024-01-12"),
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    userId: "user1"
  },
  {
    id: "5",
    title: "Posto Shell",
    description: "Combustível",
    amount: 120,
    type: "EXPENSE" as TransactionType,
    category: "Transporte",
    date: new Date("2024-01-11"),
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
    userId: "user1"
  },
  {
    id: "6",
    title: "Dividendos PETR4",
    description: "Dividendos de ações",
    amount: 150,
    type: "INCOME" as TransactionType,
    category: "Investimentos",
    date: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    userId: "user1"
  },
  {
    id: "7",
    title: "Farmácia",
    description: "Medicamentos",
    amount: 85.50,
    type: "EXPENSE" as TransactionType,
    category: "Saúde",
    date: new Date("2024-01-09"),
    createdAt: new Date("2024-01-09"),
    updatedAt: new Date("2024-01-09"),
    userId: "user1"
  },
  {
    id: "8",
    title: "Academia",
    description: "Mensalidade janeiro",
    amount: 89.90,
    type: "EXPENSE" as TransactionType,
    category: "Saúde",
    date: new Date("2024-01-08"),
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    userId: "user1"
  }
]

export default function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = Array.from(new Set(mockTransactions.map(t => t.category)))

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const totalBalance = mockTransactions.reduce((acc, transaction) => {
    return acc + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount)
  }, 0)

  const totalIncome = mockTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = mockTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +R$ {totalIncome.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -R$ {totalExpenses.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalBalance >= 0 ? '+' : ''}R$ {totalBalance.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Gerencie todas as suas transações financeiras
              </CardDescription>
            </div>
            <AddTransactionModal />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="INCOME">Receitas</SelectItem>
                <SelectItem value="EXPENSE">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.title}</div>
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'INCOME' ? 'default' : 'destructive'}>
                        {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.date.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}