import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let categoryId: string;

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
        name: 'Category Test User',
        email: 'category.test@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = userResponse.body.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'category.test@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/categories (POST)', () => {
    it('should create a new income category', async () => {
      const createCategoryDto = {
        name: 'Freelance Income',
        description: 'Income from freelance work',
        color: '#4CAF50',
        icon: 'work',
        type: 'INCOME',
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createCategoryDto.name);
      expect(response.body.type).toBe(createCategoryDto.type);
      expect(response.body.userId).toBe(userId);
      
      categoryId = response.body.id; // Store for later tests
    });

    it('should create a new expense category', async () => {
      const createCategoryDto = {
        name: 'Food & Dining',
        description: 'Restaurants and groceries',
        color: '#F44336',
        icon: 'restaurant',
        type: 'EXPENSE',
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(201);

      expect(response.body.name).toBe(createCategoryDto.name);
      expect(response.body.type).toBe(createCategoryDto.type);
    });

    it('should fail to create duplicate category', async () => {
      const createCategoryDto = {
        name: 'Freelance Income', // Same name as first test
        type: 'INCOME',
      };

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(409);
    });

    it('should fail without authentication', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        type: 'INCOME',
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(createCategoryDto)
        .expect(401);
    });

    it('should fail with invalid color format', async () => {
      const createCategoryDto = {
        name: 'Invalid Color Category',
        color: 'invalid-color',
        type: 'INCOME',
      };

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    it('should get all categories for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Two categories created in previous tests
    });

    it('should filter categories by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?type=INCOME')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((category) => {
        expect(category.type).toBe('INCOME');
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/categories')
        .expect(401);
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should get a specific category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe('Freelance Income');
    });

    it('should fail for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('should update a category', async () => {
      const updateDto = {
        name: 'Updated Freelance Income',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.description).toBe(updateDto.description);
    });

    it('should fail to update with duplicate name', async () => {
      const updateDto = {
        name: 'Food & Dining', // Name already exists
      };

      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(409);
    });
  });

  describe('/categories/setup-defaults (POST)', () => {
    it('should create default categories', async () => {
      // First, delete existing categories
      await prisma.category.deleteMany({ where: { userId } });

      const response = await request(app.getHttpServer())
        .post('/categories/setup-defaults')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Check that default categories were created
      const categories = await prisma.category.findMany({ where: { userId } });
      expect(categories.length).toBeGreaterThan(0);
      
      const defaultCategories = categories.filter(c => c.isDefault);
      expect(defaultCategories.length).toBeGreaterThan(0);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    let deletableCategory: any;

    beforeEach(async () => {
      // Create a category that can be deleted
      deletableCategory = await prisma.category.create({
        data: {
          name: 'Deletable Category',
          type: 'INCOME',
          userId,
          isDefault: false,
        },
      });
    });

    it('should delete a category', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${deletableCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify category was deleted
      const category = await prisma.category.findUnique({
        where: { id: deletableCategory.id },
      });
      expect(category).toBeNull();
    });

    it('should fail to delete default category', async () => {
      const defaultCategory = await prisma.category.findFirst({
        where: { userId, isDefault: true },
      });

      if (defaultCategory) {
        await request(app.getHttpServer())
          .delete(`/categories/${defaultCategory.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);
      }
    });
  });
});