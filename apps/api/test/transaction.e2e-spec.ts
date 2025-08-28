import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let incomeCategory: any;
  let expenseCategory: any;
  let transactionId: string;
  let installmentGroupId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean database
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Transaction Test User',
        email: 'transaction.test@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = userResponse.body.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'transaction.test@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken = loginResponse.body.accessToken;

    // Create test categories
    incomeCategory = await prisma.category.create({
      data: {
        name: 'Test Income',
        type: 'INCOME',
        userId,
      },
    });

    expenseCategory = await prisma.category.create({
      data: {
        name: 'Test Expense',
        type: 'EXPENSE',
        userId,
      },
    });
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/transactions (POST)', () => {
    it('should create a simple income transaction', async () => {
      const createTransactionDto = {
        description: 'Freelance payment',
        amount: 1500.00,
        type: 'INCOME',
        paymentMethod: 'PIX',
        categoryId: incomeCategory.id,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(createTransactionDto.description);
      expect(Number(response.body.amount)).toBe(createTransactionDto.amount);
      expect(response.body.type).toBe(createTransactionDto.type);
      expect(response.body.category).toBeDefined();
      expect(response.body.category.name).toBe(incomeCategory.name);

      transactionId = response.body.id;
    });

    it('should create an expense transaction with interest and tax', async () => {
      const createTransactionDto = {
        description: 'Personal loan',
        amount: 1000.00,
        type: 'EXPENSE',
        paymentMethod: 'LOAN',
        categoryId: expenseCategory.id,
        interestRate: 10.0,
        taxRate: 2.0,
        originalAmount: 1000.00,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201);

      expect(response.body.interestRate).toBe(createTransactionDto.interestRate);
      expect(response.body.taxRate).toBe(createTransactionDto.taxRate);
      // Amount should be calculated: 1000 * 1.10 * 1.02 = 1122
      expect(Number(response.body.amount)).toBe(1122);
    });

    it('should create a recurring transaction', async () => {
      const createTransactionDto = {
        description: 'Monthly salary',
        amount: 5000.00,
        type: 'INCOME',
        paymentMethod: 'BANK_TRANSFER',
        categoryId: incomeCategory.id,
        isRecurring: true,
        recurringDay: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201);

      expect(response.body.isRecurring).toBe(true);
      expect(response.body.recurringDay).toBe(5);
    });

    it('should fail with invalid category', async () => {
      const createTransactionDto = {
        description: 'Invalid category test',
        amount: 100.00,
        type: 'EXPENSE',
        paymentMethod: 'CASH',
        categoryId: 'invalid-category-id',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      const createTransactionDto = {
        description: 'Test transaction',
        amount: 100.00,
        type: 'EXPENSE',
        paymentMethod: 'CASH',
        categoryId: expenseCategory.id,
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(createTransactionDto)
        .expect(401);
    });
  });

  describe('/transactions/installments (POST)', () => {
    it('should create installment transactions', async () => {
      const createInstallmentDto = {
        description: 'iPhone 15 Pro',
        amount: 6000.00,
        type: 'EXPENSE',
        paymentMethod: 'CREDIT_CARD',
        categoryId: expenseCategory.id,
        isInstallment: true,
        totalInstallments: 12,
        interestRate: 2.5,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions/installments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createInstallmentDto)
        .expect(201);

      expect(response.body).toHaveProperty('installmentGroupId');
      expect(response.body).toHaveProperty('transactions');
      expect(response.body.transactions).toHaveLength(12);
      expect(response.body.totalInstallments).toBe(12);

      installmentGroupId = response.body.installmentGroupId;

      // Check that each installment has correct properties
      response.body.transactions.forEach((transaction, index) => {
        expect(transaction.isInstallment).toBe(true);
        expect(transaction.installmentNum).toBe(index + 1);
        expect(transaction.totalInstallments).toBe(12);
        expect(transaction.installmentGroupId).toBe(installmentGroupId);
        expect(transaction.description).toContain(`(${index + 1}/12)`);
      });
    });

    it('should fail to create installments with invalid installment count', async () => {
      const createInstallmentDto = {
        description: 'Invalid installments',
        amount: 1000.00,
        type: 'EXPENSE',
        paymentMethod: 'CREDIT_CARD',
        categoryId: expenseCategory.id,
        isInstallment: true,
        totalInstallments: 100, // Too many installments
      };

      await request(app.getHttpServer())
        .post('/transactions/installments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createInstallmentDto)
        .expect(400);
    });
  });

  describe('/transactions (GET)', () => {
    it('should get all transactions with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?type=INCOME')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((transaction) => {
        expect(transaction.type).toBe('INCOME');
      });
    });

    it('should filter transactions by payment method', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?paymentMethod=PIX')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((transaction) => {
        expect(transaction.paymentMethod).toBe('PIX');
      });
    });

    it('should filter installment transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?isInstallment=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((transaction) => {
        expect(transaction.isInstallment).toBe(true);
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .expect(401);
    });
  });

  describe('/transactions/:id (GET)', () => {
    it('should get a specific transaction', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(transactionId);
      expect(response.body).toHaveProperty('category');
    });

    it('should fail for non-existent transaction', async () => {
      await request(app.getHttpServer())
        .get('/transactions/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/transactions/installments/:groupId (GET)', () => {
    it('should get installment group details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transactions/installments/${installmentGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.installmentGroupId).toBe(installmentGroupId);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body).toHaveProperty('paidAmount');
      expect(response.body).toHaveProperty('remainingAmount');
      expect(response.body.transactions).toHaveLength(12);
    });

    it('should fail for non-existent installment group', async () => {
      await request(app.getHttpServer())
        .get('/transactions/installments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/transactions/summary/:year/:month (GET)', () => {
    it('should get monthly summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions/summary/2024/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('income');
      expect(response.body).toHaveProperty('expense');
      expect(response.body).toHaveProperty('balance');
      expect(typeof response.body.income).toBe('number');
      expect(typeof response.body.expense).toBe('number');
      expect(typeof response.body.balance).toBe('number');
    });
  });

  describe('/transactions/:id (PATCH)', () => {
    it('should update a transaction', async () => {
      const updateDto = {
        description: 'Updated freelance payment',
        amount: 1800.00,
      };

      const response = await request(app.getHttpServer())
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.description).toBe(updateDto.description);
      expect(Number(response.body.amount)).toBe(updateDto.amount);
    });

    it('should fail to update installment transaction individually', async () => {
      // Get an installment transaction
      const installmentTransactions = await prisma.transaction.findMany({
        where: { installmentGroupId, userId },
        take: 1,
      });

      if (installmentTransactions.length > 0) {
        const updateDto = { description: 'Should fail' };

        await request(app.getHttpServer())
          .patch(`/transactions/${installmentTransactions[0].id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateDto)
          .expect(400);
      }
    });
  });

  describe('/transactions/:id/payment-status (PATCH)', () => {
    it('should mark installment as paid', async () => {
      // Get an unpaid installment transaction
      const installmentTransaction = await prisma.transaction.findFirst({
        where: { 
          installmentGroupId, 
          userId, 
          isPaid: false 
        },
      });

      if (installmentTransaction) {
        const response = await request(app.getHttpServer())
          .patch(`/transactions/${installmentTransaction.id}/payment-status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ isPaid: true })
          .expect(200);

        expect(response.body.isPaid).toBe(true);
      }
    });

    it('should fail for non-installment transaction', async () => {
      await request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/payment-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPaid: true })
        .expect(400);
    });
  });

  describe('/transactions/:id (DELETE)', () => {
    it('should delete a single transaction', async () => {
      await request(app.getHttpServer())
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify transaction was deleted
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });
      expect(transaction).toBeNull();
    });

    it('should fail to delete individual installment transaction', async () => {
      // Get an installment transaction
      const installmentTransaction = await prisma.transaction.findFirst({
        where: { installmentGroupId, userId },
      });

      if (installmentTransaction) {
        await request(app.getHttpServer())
          .delete(`/transactions/${installmentTransaction.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      }
    });
  });

  describe('/transactions/installments/:groupId (DELETE)', () => {
    it('should delete entire installment group', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/transactions/installments/${installmentGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deletedCount');
      expect(response.body.deletedCount).toBe(12);

      // Verify all transactions were deleted
      const transactions = await prisma.transaction.findMany({
        where: { installmentGroupId },
      });
      expect(transactions).toHaveLength(0);
    });

    it('should fail for non-existent installment group', async () => {
      await request(app.getHttpServer())
        .delete('/transactions/installments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});