import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateInstallmentTransactionDto,
  TransactionFilterDto,
} from './dto/transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    // Validate category belongs to user
    await this.validateCategoryOwnership(userId, createTransactionDto.categoryId);

    // If it's an installment transaction, use the installment method
    if (createTransactionDto.isInstallment && createTransactionDto.totalInstallments) {
      return this.createInstallmentTransactions(userId, createTransactionDto as CreateInstallmentTransactionDto);
    }

    // Calculate amounts if interest or tax rates are provided
    const calculatedAmounts = this.calculateAmounts(
      createTransactionDto.amount,
      createTransactionDto.interestRate,
      createTransactionDto.taxRate,
    );

    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        ...calculatedAmounts,
        userId,
        date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
        dueDate: createTransactionDto.dueDate ? new Date(createTransactionDto.dueDate) : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
    });
  }

  async createInstallmentTransactions(userId: string, createInstallmentDto: CreateInstallmentTransactionDto) {
    const installmentGroupId = uuidv4();
    const baseDate = createInstallmentDto.date ? new Date(createInstallmentDto.date) : new Date();
    const installmentAmount = createInstallmentDto.amount / createInstallmentDto.totalInstallments;

    const transactions: any[] = [];

    // Calculate amounts with interest/tax
    const calculatedAmounts = this.calculateAmounts(
      installmentAmount,
      createInstallmentDto.interestRate,
      createInstallmentDto.taxRate,
    );

    for (let i = 1; i <= createInstallmentDto.totalInstallments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

      const transactionData = {
        description: `${createInstallmentDto.description} (${i}/${createInstallmentDto.totalInstallments})`,
        amount: calculatedAmounts.amount,
        originalAmount: calculatedAmounts.originalAmount,
        type: createInstallmentDto.type,
        paymentMethod: createInstallmentDto.paymentMethod,
        categoryId: createInstallmentDto.categoryId,
        userId,
        date: installmentDate,
        dueDate: createInstallmentDto.dueDate ? new Date(createInstallmentDto.dueDate) : null,
        isPaid: i === 1 ? (createInstallmentDto.isPaid ?? true) : false, // Only first installment paid by default
        isInstallment: true,
        installmentNum: i,
        totalInstallments: createInstallmentDto.totalInstallments,
        installmentGroupId,
        interestRate: createInstallmentDto.interestRate,
        taxRate: createInstallmentDto.taxRate,
      };

      const transaction = await this.prisma.transaction.create({
        data: transactionData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
        },
      });

      transactions.push(transaction);
    }

    return {
      installmentGroupId,
      transactions,
      totalAmount: createInstallmentDto.amount,
      installmentAmount: calculatedAmounts.amount,
      totalInstallments: createInstallmentDto.totalInstallments,
    };
  }

  async findAll(userId: string, filterDto: TransactionFilterDto) {
    const { page = 1, limit = 20, startDate, endDate, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...filters,
    };

    // Date filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findInstallmentGroup(userId: string, installmentGroupId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        installmentGroupId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
      orderBy: { installmentNum: 'asc' },
    });

    if (transactions.length === 0) {
      throw new NotFoundException('Installment group not found');
    }

    return {
      installmentGroupId,
      transactions,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      paidAmount: transactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.amount, 0),
      remainingAmount: transactions.filter(t => !t.isPaid).reduce((sum, t) => sum + t.amount, 0),
      totalInstallments: transactions[0].totalInstallments,
      paidInstallments: transactions.filter(t => t.isPaid).length,
    };
  }

  async update(userId: string, id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.findOne(userId, id);

    // If updating category, validate ownership
    if (updateTransactionDto.categoryId) {
      await this.validateCategoryOwnership(userId, updateTransactionDto.categoryId);
    }

    // Don't allow updating installment transactions individually if they're part of a group
    if (transaction.isInstallment && transaction.installmentGroupId) {
      throw new BadRequestException(
        'Cannot update individual installment transactions. Update the entire group instead.',
      );
    }

    // Calculate amounts if interest or tax rates are being updated
    let calculatedAmounts = {};
    if (updateTransactionDto.amount || updateTransactionDto.interestRate || updateTransactionDto.taxRate) {
      const amount = updateTransactionDto.amount ?? transaction.amount;
      const interestRate = updateTransactionDto.interestRate ?? transaction.interestRate;
      const taxRate = updateTransactionDto.taxRate ?? transaction.taxRate;
      
      calculatedAmounts = this.calculateAmounts(amount, interestRate || undefined, taxRate || undefined);
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        ...calculatedAmounts,
        date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : undefined,
        dueDate: updateTransactionDto.dueDate ? new Date(updateTransactionDto.dueDate) : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);

    // If it's part of an installment group, offer to delete the entire group
    if (transaction.isInstallment && transaction.installmentGroupId) {
      throw new BadRequestException(
        'This transaction is part of an installment group. Use /transactions/installments/:groupId to delete the entire group.',
      );
    }

    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transaction deleted successfully' };
  }

  async removeInstallmentGroup(userId: string, installmentGroupId: string) {
    // Verify the group belongs to the user
    const transactions = await this.prisma.transaction.findMany({
      where: { installmentGroupId, userId },
    });

    if (transactions.length === 0) {
      throw new NotFoundException('Installment group not found');
    }

    await this.prisma.transaction.deleteMany({
      where: { installmentGroupId },
    });

    return { 
      message: 'Installment group deleted successfully',
      deletedCount: transactions.length,
    };
  }

  async markInstallmentAsPaid(userId: string, id: string, isPaid: boolean = true) {
    const transaction = await this.findOne(userId, id);

    if (!transaction.isInstallment) {
      throw new BadRequestException('Transaction is not an installment');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { isPaid },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
    });
  }

  async getMonthlySum(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isPaid: true,
      },
      _sum: {
        amount: true,
      },
    });

    const summary = {
      income: 0,
      expense: 0,
      balance: 0,
    };

    result.forEach((item) => {
      if (item.type === 'INCOME') {
        summary.income = item._sum.amount || 0;
      } else if (item.type === 'EXPENSE') {
        summary.expense = item._sum.amount || 0;
      }
    });

    summary.balance = summary.income - summary.expense;

    return summary;
  }

  private async validateCategoryOwnership(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found or does not belong to user');
    }

    return category;
  }

  async getDashboardData(userId: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Resumo do mês atual
    const monthlySum = await this.getMonthlySum(userId, currentYear, currentMonth);
    
    // Transações recentes (últimas 5, mas deduplicadas por parcelamento)
    const allRecentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Buscar mais para poder deduplicar
    });

    // Deduplicar transações parceladas (mostrar apenas uma por grupo)
    const seenGroups = new Set();
    const recentTransactions = [];
    
    for (const transaction of allRecentTransactions) {
      if (transaction.isInstallment && transaction.installmentGroupId) {
        if (!seenGroups.has(transaction.installmentGroupId)) {
          seenGroups.add(transaction.installmentGroupId);
          // Para parcelamentos, vamos mostrar o valor total e indicar que é parcelado
          recentTransactions.push({
            ...transaction,
            description: `${transaction.description} (Parcelado)`,
            amount: transaction.totalInstallments ? 
              transaction.amount * transaction.totalInstallments : 
              transaction.amount,
            installmentInfo: `${transaction.totalInstallments}x de ${transaction.amount}`
          });
        }
      } else {
        recentTransactions.push(transaction);
      }
      
      if (recentTransactions.length >= 5) break;
    }

    // Próximas parcelas vencendo (próximos 30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingInstallments = await this.prisma.transaction.findMany({
      where: {
        userId,
        isInstallment: true,
        isPaid: false,
        dueDate: {
          gte: currentDate,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Gastos por categoria (mês atual)
    const categoryExpenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        isPaid: true,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Buscar nomes das categorias
    const categoryIds = categoryExpenses.map(exp => exp.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const expensesByCategory = categoryExpenses.map(exp => {
      const category = categories.find(cat => cat.id === exp.categoryId);
      return {
        categoryId: exp.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#gray',
        categoryIcon: category?.icon || 'circle',
        amount: exp._sum.amount || 0,
      };
    }).sort((a, b) => b.amount - a.amount);

    // Estatísticas gerais
    const totalTransactions = await this.prisma.transaction.count({
      where: { userId },
    });

    const pendingInstallments = await this.prisma.transaction.count({
      where: {
        userId,
        isInstallment: true,
        isPaid: false,
      },
    });

    // Gastos por método de pagamento (mês atual)
    const expensesByPaymentMethod = await this.prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: {
        userId,
        type: 'EXPENSE',
        isPaid: true,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Receitas por método de pagamento (mês atual)  
    const incomeByPaymentMethod = await this.prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: {
        userId,
        type: 'INCOME',
        isPaid: true,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      monthlySum,
      recentTransactions,
      upcomingInstallments,
      expensesByCategory,
      expensesByPaymentMethod: expensesByPaymentMethod.map(item => ({
        paymentMethod: item.paymentMethod,
        amount: item._sum.amount || 0,
      })).sort((a, b) => b.amount - a.amount),
      incomeByPaymentMethod: incomeByPaymentMethod.map(item => ({
        paymentMethod: item.paymentMethod,
        amount: item._sum.amount || 0,
      })).sort((a, b) => b.amount - a.amount),
      categoryTrends: await this.getCategoryExpenseTrends(userId),
      stats: {
        totalTransactions,
        pendingInstallments,
        currentMonth: currentMonth,
        currentYear: currentYear,
      },
    };
  }

  async getCategoryExpenseTrends(userId: string) {
    const monthsData = [];
    const currentDate = new Date();
    
    // Últimos 6 meses incluindo o atual
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Gastos por categoria neste mês
      const monthlyExpenses = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'EXPENSE',
          isPaid: true,
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
        _sum: {
          amount: true,
        },
      });

      monthsData.push({
        month: monthName,
        year: year,
        monthNum: month,
        expenses: monthlyExpenses,
      });
    }

    // Buscar todas as categorias que aparecem nos dados
    const allCategoryIds = new Set();
    monthsData.forEach(monthData => {
      monthData.expenses.forEach(expense => {
        allCategoryIds.add(expense.categoryId);
      });
    });

    const categories = await this.prisma.category.findMany({
      where: { id: { in: Array.from(allCategoryIds) } },
      select: { id: true, name: true, color: true },
    });

    // Transformar dados para formato do gráfico
    const chartData = monthsData.map(monthData => {
      const monthRow: any = { month: monthData.month };
      
      categories.forEach(category => {
        const expense = monthData.expenses.find(e => e.categoryId === category.id);
        monthRow[category.name] = expense?._sum.amount || 0;
      });
      
      return monthRow;
    });

    return {
      chartData,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color || '#8884d8',
      })),
    };
  }

  async getTableData(userId: string, filterDto: TransactionFilterDto) {
    const {
      type,
      paymentMethod,
      categoryId,
      startDate,
      endDate,
      month,
      year,
      isPaid,
      isRecurring,
      isInstallment,
      page = 1,
      limit = 20,
    } = filterDto;

    const skip = (page - 1) * limit;
    const where: any = { userId };

    // Aplicar filtros
    if (type) where.type = type;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (categoryId) where.categoryId = categoryId;
    if (isPaid !== undefined) where.isPaid = isPaid;
    if (isRecurring !== undefined) where.isRecurring = isRecurring;
    if (isInstallment !== undefined) where.isInstallment = isInstallment;

    // Filtro por mês/ano específico tem prioridade sobre startDate/endDate
    if (month && year) {
      // Para transações parceladas, filtrar por dueDate (vencimento)
      // Para outras transações, filtrar por date
      where.OR = [
        {
          AND: [
            { isInstallment: false },
            {
              date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          ],
        },
        {
          AND: [
            { isInstallment: true },
            {
              dueDate: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          ],
        },
      ];
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Buscar transações com paginação
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              type: true,
            },
          },
        },
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Calcular totais
    const summaryWhere = { ...where };
    delete summaryWhere.skip;
    delete summaryWhere.take;

    const [incomeSum, expenseSum] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'INCOME', isPaid: true },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'EXPENSE', isPaid: true },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeSum._sum.amount || 0;
    const totalExpense = expenseSum._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
      },
      filters: filterDto,
    };
  }

  private calculateAmounts(amount: number, interestRate?: number, taxRate?: number) {
    let originalAmount = amount;
    let finalAmount = amount;

    if (interestRate && interestRate > 0) {
      finalAmount = originalAmount * (1 + interestRate / 100);
    }

    if (taxRate && taxRate > 0) {
      finalAmount = finalAmount * (1 + taxRate / 100);
    }

    return {
      amount: finalAmount,
      originalAmount: interestRate || taxRate ? originalAmount : null,
    };
  }
}