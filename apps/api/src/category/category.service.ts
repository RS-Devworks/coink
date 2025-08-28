import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Check if category name already exists for this user and type
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        userId,
        type: createCategoryDto.type,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category '${createCategoryDto.name}' already exists for ${createCategoryDto.type.toLowerCase()}`,
      );
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        type: true,
        isDefault: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(userId: string, type?: TransactionType) {
    const whereClause: any = { userId };
    
    if (type) {
      whereClause.type = type;
    }

    return this.prisma.category.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        type: true,
        isDefault: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        type: true,
        isDefault: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists and belongs to user
    const existingCategory = await this.findOne(userId, id);

    // Check if trying to update name and if it would conflict
    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const conflictCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          userId,
          type: updateCategoryDto.type || existingCategory.type,
          id: { not: id },
        },
      });

      if (conflictCategory) {
        throw new ConflictException(
          `Category '${updateCategoryDto.name}' already exists for this transaction type`,
        );
      }
    }

    // Don't allow updating default categories to non-default
    if (existingCategory.isDefault && updateCategoryDto.hasOwnProperty('isDefault')) {
      throw new ForbiddenException('Cannot modify default category status');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        type: true,
        isDefault: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    const category = await this.findOne(userId, id);

    // Don't allow deletion of default categories
    if (category.isDefault) {
      throw new ForbiddenException('Cannot delete default categories');
    }

    // Check if category has transactions
    if (category._count.transactions > 0) {
      throw new ConflictException(
        'Cannot delete category that has associated transactions',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  async createDefaultCategories(userId: string) {
    const defaultIncomeCategories = [
      { name: 'Salário', description: 'Salário mensal', color: '#4CAF50', icon: 'salary' },
      { name: 'Freelance', description: 'Trabalhos freelance', color: '#2196F3', icon: 'freelance' },
      { name: 'Investimentos', description: 'Rendimentos de investimentos', color: '#FF9800', icon: 'investment' },
      { name: 'Outros', description: 'Outras receitas', color: '#9E9E9E', icon: 'other' },
    ];

    const defaultExpenseCategories = [
      { name: 'Alimentação', description: 'Supermercado, restaurantes', color: '#F44336', icon: 'food' },
      { name: 'Transporte', description: 'Combustível, transporte público', color: '#3F51B5', icon: 'transport' },
      { name: 'Moradia', description: 'Aluguel, contas da casa', color: '#795548', icon: 'home' },
      { name: 'Saúde', description: 'Médico, farmácia, plano de saúde', color: '#E91E63', icon: 'health' },
      { name: 'Educação', description: 'Cursos, livros, material', color: '#9C27B0', icon: 'education' },
      { name: 'Lazer', description: 'Cinema, jogos, hobbies', color: '#00BCD4', icon: 'entertainment' },
      { name: 'Roupas', description: 'Vestuário e acessórios', color: '#607D8B', icon: 'clothing' },
      { name: 'Outros', description: 'Outras despesas', color: '#9E9E9E', icon: 'other' },
    ];

    const createCategories = async (categories: any[], type: TransactionType) => {
      for (const category of categories) {
        await this.prisma.category.create({
          data: {
            ...category,
            type,
            isDefault: true,
            userId,
          },
        });
      }
    };

    await createCategories(defaultIncomeCategories, TransactionType.INCOME);
    await createCategories(defaultExpenseCategories, TransactionType.EXPENSE);
  }
}