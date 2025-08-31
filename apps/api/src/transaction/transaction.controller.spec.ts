import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionType, PaymentMethod } from '@prisma/client';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  const mockTransactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePaymentStatus: jest.fn(),
    getDashboardData: jest.fn(),
    getTableData: jest.fn(),
    getInstallmentGroup: jest.fn(),
    deleteInstallmentGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createDto: CreateTransactionDto = {
        description: 'Test transaction',
        amount: 100,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CASH,
        categoryId: 'category-id',
        date: new Date(),
        isPaid: true,
      };

      const mockUser = { id: 'user-id' };
      const mockTransaction = {
        id: 'transaction-id',
        ...createDto,
        userId: 'user-id',
      };

      mockTransactionService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockTransaction);
      expect(service.create).toHaveBeenCalledWith('user-id', createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const filterDto: TransactionFilterDto = {
        page: 1,
        limit: 10,
        type: TransactionType.EXPENSE,
      };

      const mockUser = { id: 'user-id' };
      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };

      mockTransactionService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith('user-id', filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 'transaction-id';
      const mockUser = { id: 'user-id' };
      const mockTransaction = {
        id: transactionId,
        description: 'Test transaction',
        userId: 'user-id',
      };

      mockTransactionService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(transactionId, mockUser);

      expect(result).toEqual(mockTransaction);
      expect(service.findOne).toHaveBeenCalledWith(transactionId, 'user-id');
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const transactionId = 'transaction-id';
      const updateDto: UpdateTransactionDto = {
        description: 'Updated transaction',
        amount: 150,
      };
      const mockUser = { id: 'user-id' };
      const mockUpdatedTransaction = {
        id: transactionId,
        ...updateDto,
        userId: 'user-id',
      };

      mockTransactionService.update.mockResolvedValue(mockUpdatedTransaction);

      const result = await controller.update(transactionId, updateDto, mockUser);

      expect(result).toEqual(mockUpdatedTransaction);
      expect(service.update).toHaveBeenCalledWith(transactionId, 'user-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      const transactionId = 'transaction-id';
      const mockUser = { id: 'user-id' };
      const mockDeletedTransaction = {
        id: transactionId,
        description: 'Deleted transaction',
        userId: 'user-id',
      };

      mockTransactionService.remove.mockResolvedValue(mockDeletedTransaction);

      const result = await controller.remove(transactionId, mockUser);

      expect(result).toEqual(mockDeletedTransaction);
      expect(service.remove).toHaveBeenCalledWith(transactionId, 'user-id');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const transactionId = 'transaction-id';
      const mockUser = { id: 'user-id' };
      const paymentStatusDto = { isPaid: true };
      const mockTransaction = {
        id: transactionId,
        isPaid: true,
        userId: 'user-id',
      };

      mockTransactionService.updatePaymentStatus.mockResolvedValue(mockTransaction);

      const result = await controller.updatePaymentStatus(
        transactionId,
        paymentStatusDto,
        mockUser,
      );

      expect(result).toEqual(mockTransaction);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(
        transactionId,
        'user-id',
        true,
      );
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockUser = { id: 'user-id' };
      const mockDashboardData = {
        monthlySum: {
          totalIncome: 5000,
          totalExpense: 3000,
          balance: 2000,
          month: 1,
          year: 2025,
        },
        recentTransactions: [],
        upcomingInstallments: [],
        expensesByCategory: [],
        expensesByPaymentMethod: [],
        incomeByPaymentMethod: [],
        stats: {
          totalTransactions: 10,
          pendingInstallments: 2,
          currentMonth: 1,
          currentYear: 2025,
        },
      };

      mockTransactionService.getDashboardData.mockResolvedValue(mockDashboardData);

      const result = await controller.getDashboard(mockUser);

      expect(result).toEqual(mockDashboardData);
      expect(service.getDashboardData).toHaveBeenCalledWith('user-id');
    });
  });

  describe('getTableData', () => {
    it('should return table data with filtering', async () => {
      const filterDto: TransactionFilterDto = {
        page: 1,
        limit: 20,
        month: 1,
        year: 2025,
      };
      const mockUser = { id: 'user-id' };
      const mockTableData = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        },
      };

      mockTransactionService.getTableData.mockResolvedValue(mockTableData);

      const result = await controller.getTableData(filterDto, mockUser);

      expect(result).toEqual(mockTableData);
      expect(service.getTableData).toHaveBeenCalledWith('user-id', filterDto);
    });
  });

  describe('getInstallmentGroup', () => {
    it('should return installment group data', async () => {
      const groupId = 'group-id';
      const mockUser = { id: 'user-id' };
      const mockInstallmentGroup = {
        transactions: [
          {
            id: 'installment-1',
            installmentNum: 1,
            totalInstallments: 3,
            amount: 100,
            isPaid: false,
          },
          {
            id: 'installment-2',
            installmentNum: 2,
            totalInstallments: 3,
            amount: 100,
            isPaid: false,
          },
          {
            id: 'installment-3',
            installmentNum: 3,
            totalInstallments: 3,
            amount: 100,
            isPaid: false,
          },
        ],
      };

      mockTransactionService.getInstallmentGroup.mockResolvedValue(mockInstallmentGroup);

      const result = await controller.getInstallmentGroup(groupId, mockUser);

      expect(result).toEqual(mockInstallmentGroup);
      expect(service.getInstallmentGroup).toHaveBeenCalledWith(groupId, 'user-id');
    });
  });

  describe('deleteInstallmentGroup', () => {
    it('should delete entire installment group', async () => {
      const groupId = 'group-id';
      const mockUser = { id: 'user-id' };
      const mockResult = { deletedCount: 3 };

      mockTransactionService.deleteInstallmentGroup.mockResolvedValue(mockResult);

      const result = await controller.deleteInstallmentGroup(groupId, mockUser);

      expect(result).toEqual(mockResult);
      expect(service.deleteInstallmentGroup).toHaveBeenCalledWith(groupId, 'user-id');
    });
  });
});