import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, PaymentMethod } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a simple transaction', async () => {
      const createDto: CreateTransactionDto = {
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CASH,
        categoryId: 'category-id',
        date: new Date(),
        isPaid: true,
      };

      const mockTransaction = {
        id: 'transaction-id',
        ...createDto,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-id',
          name: 'Food',
          color: '#ff0000',
          icon: null,
          type: TransactionType.EXPENSE,
        },
      };

      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create('user-id', createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          userId: 'user-id',
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
    });

    it('should create installment transactions', async () => {
      const createDto: CreateTransactionDto = {
        description: 'Credit card purchase',
        amount: 300,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        categoryId: 'category-id',
        date: new Date('2025-01-01'),
        isPaid: false,
        isInstallment: true,
        totalInstallments: 3,
      };

      const mockInstallments = [
        {
          id: 'installment-1',
          description: 'Credit card purchase (1/3)',
          amount: 100,
          installmentNum: 1,
          totalInstallments: 3,
          installmentGroupId: 'group-id',
        },
        {
          id: 'installment-2',
          description: 'Credit card purchase (2/3)',
          amount: 100,
          installmentNum: 2,
          totalInstallments: 3,
          installmentGroupId: 'group-id',
        },
        {
          id: 'installment-3',
          description: 'Credit card purchase (3/3)',
          amount: 100,
          installmentNum: 3,
          totalInstallments: 3,
          installmentGroupId: 'group-id',
        },
      ];

      // Mock the transaction creation calls
      mockPrismaService.transaction.create
        .mockResolvedValueOnce(mockInstallments[0])
        .mockResolvedValueOnce(mockInstallments[1])
        .mockResolvedValueOnce(mockInstallments[2]);

      const result = await service.create('user-id', createDto);

      expect(result).toEqual({
        installmentGroupId: expect.any(String),
        transactions: mockInstallments,
        totalAmount: 300,
        installmentAmount: 100,
        totalInstallments: 3,
      });

      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          description: 'Test transaction 1',
          amount: 100,
          type: TransactionType.EXPENSE,
          userId: 'user-id',
          category: { name: 'Food' },
        },
        {
          id: 'transaction-2',
          description: 'Test transaction 2',
          amount: 200,
          type: TransactionType.INCOME,
          userId: 'user-id',
          category: { name: 'Salary' },
        },
      ];

      mockPrismaService.transaction.count.mockResolvedValue(2);
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.findAll('user-id', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: mockTransactions,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('should filter transactions by type', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        type: TransactionType.EXPENSE,
      };

      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll('user-id', filterDto);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: TransactionType.EXPENSE,
          }),
        }),
      );
    });

    it('should filter transactions by payment method', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        paymentMethod: PaymentMethod.CASH,
      };

      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll('user-id', filterDto);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paymentMethod: PaymentMethod.CASH,
          }),
        }),
      );
    });

    it('should filter transactions by date range', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      };

      mockPrismaService.transaction.count.mockResolvedValue(1);
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll('user-id', filterDto);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: filterDto.startDate,
              lte: filterDto.endDate,
            },
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const updateDto = {
        description: 'Updated transaction',
        amount: 150,
      };

      const mockUpdatedTransaction = {
        id: 'transaction-id',
        description: 'Updated transaction',
        amount: 150,
        userId: 'user-id',
        category: { name: 'Food' },
      };

      mockPrismaService.transaction.update.mockResolvedValue(mockUpdatedTransaction);

      const result = await service.update('transaction-id', 'user-id', updateDto);

      expect(result).toEqual(mockUpdatedTransaction);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: {
          id: 'transaction-id',
          userId: 'user-id',
        },
        data: updateDto,
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
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        description: 'To be deleted',
        userId: 'user-id',
      };

      mockPrismaService.transaction.delete.mockResolvedValue(mockTransaction);

      const result = await service.remove('transaction-id', 'user-id');

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: {
          id: 'transaction-id',
          userId: 'user-id',
        },
      });
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status of a transaction', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        isPaid: true,
        userId: 'user-id',
      };

      mockPrismaService.transaction.update.mockResolvedValue(mockTransaction);

      const result = await service.updatePaymentStatus('transaction-id', 'user-id', true);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: {
          id: 'transaction-id',
          userId: 'user-id',
        },
        data: {
          isPaid: true,
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
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data with financial summary', async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Mock monthly sum
      mockPrismaService.transaction.groupBy.mockResolvedValueOnce([
        { type: TransactionType.INCOME, _sum: { amount: 5000 } },
        { type: TransactionType.EXPENSE, _sum: { amount: 3000 } },
      ]);

      // Mock recent transactions
      mockPrismaService.transaction.findMany.mockResolvedValueOnce([
        {
          id: 'recent-1',
          description: 'Recent transaction',
          amount: 100,
          category: { name: 'Food' },
        },
      ]);

      // Mock upcoming installments
      mockPrismaService.transaction.findMany.mockResolvedValueOnce([]);

      // Mock expenses by category
      mockPrismaService.transaction.groupBy.mockResolvedValueOnce([
        { categoryId: 'cat-1', _sum: { amount: 1000 } },
      ]);

      // Mock categories
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Food', color: '#ff0000' },
      ]);

      // Mock expenses by payment method
      mockPrismaService.transaction.groupBy.mockResolvedValueOnce([
        { paymentMethod: PaymentMethod.CASH, _sum: { amount: 500 } },
      ]);

      // Mock income by payment method
      mockPrismaService.transaction.groupBy.mockResolvedValueOnce([
        { paymentMethod: PaymentMethod.BANK_TRANSFER, _sum: { amount: 5000 } },
      ]);

      // Mock total transactions count
      mockPrismaService.transaction.count.mockResolvedValue(10);

      // Mock pending installments count
      mockPrismaService.transaction.count.mockResolvedValue(2);

      const result = await service.getDashboardData('user-id');

      expect(result).toHaveProperty('monthlySum');
      expect(result).toHaveProperty('recentTransactions');
      expect(result).toHaveProperty('upcomingInstallments');
      expect(result).toHaveProperty('expensesByCategory');
      expect(result).toHaveProperty('expensesByPaymentMethod');
      expect(result).toHaveProperty('incomeByPaymentMethod');
      expect(result).toHaveProperty('stats');

      expect(result.monthlySum).toEqual({
        totalIncome: 5000,
        totalExpense: 3000,
        balance: 2000,
        month: currentMonth,
        year: currentYear,
      });
    });
  });
});