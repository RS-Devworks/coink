export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  BOLETO = 'BOLETO',
  LOAN = 'LOAN'
}

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  type: TransactionType
  isDefault: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  date: Date
  dueDate?: Date
  isPaid: boolean
  isRecurring: boolean
  recurringDay?: number
  isInstallment: boolean
  installmentNum?: number
  totalInstallments?: number
  installmentGroupId?: string
  interestRate?: number
  taxRate?: number
  originalAmount?: number
  userId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category: Category
}

export interface CreateTransactionRequest {
  description: string
  amount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  categoryId: string
  date?: Date
  dueDate?: Date
  isPaid?: boolean
  isRecurring?: boolean
  recurringDay?: number
  isInstallment?: boolean
  totalInstallments?: number
  interestRate?: number
  taxRate?: number
  originalAmount?: number
}

export interface CreateInstallmentTransactionRequest {
  description: string
  totalAmount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  categoryId: string
  installments: number
  firstPaymentDate: Date
  interestRate?: number
  downPayment?: number
}

export interface UpdateTransactionRequest {
  description?: string
  amount?: number
  type?: TransactionType
  paymentMethod?: PaymentMethod
  categoryId?: string
  date?: Date
  dueDate?: Date
  isPaid?: boolean
  isRecurring?: boolean
  recurringDay?: number
  interestRate?: number
  taxRate?: number
  originalAmount?: number
}

export interface TransactionFilterParams {
  type?: TransactionType
  paymentMethod?: PaymentMethod
  categoryId?: string
  startDate?: string
  endDate?: string
  isPaid?: boolean
  isRecurring?: boolean
  isInstallment?: boolean
  page?: number
  limit?: number
}

export interface MonthlyTransactionSummary {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  balance: number
  byCategory: Array<{
    categoryId: string
    categoryName: string
    total: number
    type: TransactionType
  }>
  byPaymentMethod: Array<{
    paymentMethod: PaymentMethod
    total: number
  }>
}

export interface TransactionResponse {
  data: Transaction[]
  total: number
  page: number
  limit: number
}

export interface InstallmentGroup {
  installmentGroupId: string
  transactions: Transaction[]
}