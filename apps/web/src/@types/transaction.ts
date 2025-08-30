export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: TransactionType
  category: string
  date: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionRequest {
  title: string
  description?: string
  amount: number
  type: TransactionType
  category: string
  date: Date
}

export interface UpdateTransactionRequest {
  title?: string
  description?: string
  amount?: number
  type?: TransactionType
  category?: string
  date?: Date
}