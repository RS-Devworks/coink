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