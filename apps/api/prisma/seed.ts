import { PrismaClient, TransactionType, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário padrão
  const hashedPassword = await bcrypt.hash('123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@coink.com' },
    update: {},
    create: {
      email: 'demo@coink.com',
      name: 'Usuário Demo',
      password: hashedPassword,
      lastAccess: new Date(),
    },
  });

  console.log('👤 Usuário criado:', user.email);

  // Criar categorias padrão para despesas
  const expenseCategories = await Promise.all([
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Alimentação', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Alimentação',
        description: 'Gastos com alimentação, supermercado, restaurantes',
        color: '#F59E0B',
        icon: 'utensils',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Transporte', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Transporte',
        description: 'Combustível, Uber, ônibus, manutenção veículo',
        color: '#3B82F6',
        icon: 'car',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Assinaturas', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Assinaturas',
        description: 'Netflix, Spotify, softwares, serviços mensais',
        color: '#8B5CF6',
        icon: 'repeat',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Saúde', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Saúde',
        description: 'Médicos, medicamentos, plano de saúde',
        color: '#10B981',
        icon: 'heart',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Casa', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Casa',
        description: 'Aluguel, luz, água, internet, manutenção',
        color: '#F97316',
        icon: 'home',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Entretenimento', 
          userId: user.id, 
          type: TransactionType.EXPENSE 
        } 
      },
      update: {},
      create: {
        name: 'Entretenimento',
        description: 'Cinema, jogos, eventos, lazer',
        color: '#EC4899',
        icon: 'gamepad-2',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: user.id,
      },
    }),
  ]);

  // Criar categorias padrão para receitas
  const incomeCategories = await Promise.all([
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Salário', 
          userId: user.id, 
          type: TransactionType.INCOME 
        } 
      },
      update: {},
      create: {
        name: 'Salário',
        description: 'Salário mensal, décimo terceiro, férias',
        color: '#22C55E',
        icon: 'banknote',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Freelance', 
          userId: user.id, 
          type: TransactionType.INCOME 
        } 
      },
      update: {},
      create: {
        name: 'Freelance',
        description: 'Trabalhos extras, projetos pontuais',
        color: '#06B6D4',
        icon: 'briefcase',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { 
        name_userId_type: { 
          name: 'Investimentos', 
          userId: user.id, 
          type: TransactionType.INCOME 
        } 
      },
      update: {},
      create: {
        name: 'Investimentos',
        description: 'Dividendos, rendimentos, vendas',
        color: '#84CC16',
        icon: 'trending-up',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: user.id,
      },
    }),
  ]);

  console.log('🏷️ Categorias criadas:', [...expenseCategories, ...incomeCategories].length);

  // Criar transações de exemplo
  const transactions = await Promise.all([
    // Receitas
    prisma.transaction.create({
      data: {
        description: 'Salário Janeiro 2024',
        amount: 4500.00,
        type: TransactionType.INCOME,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        date: new Date(2024, 0, 5),
        isPaid: true,
        isRecurring: true,
        recurringDay: 5,
        userId: user.id,
        categoryId: incomeCategories[0].id, // Salário
      },
    }),

    // Despesas fixas/recorrentes
    prisma.transaction.create({
      data: {
        description: 'Netflix Premium',
        amount: 45.90,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        date: new Date(2024, 0, 10),
        dueDate: new Date(2024, 0, 15),
        isPaid: true,
        isRecurring: true,
        recurringDay: 10,
        userId: user.id,
        categoryId: expenseCategories[2].id, // Assinaturas
      },
    }),

    prisma.transaction.create({
      data: {
        description: 'Spotify Individual',
        amount: 21.90,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        date: new Date(2024, 0, 15),
        dueDate: new Date(2024, 0, 20),
        isPaid: true,
        isRecurring: true,
        recurringDay: 15,
        userId: user.id,
        categoryId: expenseCategories[2].id, // Assinaturas
      },
    }),

    // Despesas variáveis
    prisma.transaction.create({
      data: {
        description: 'Supermercado Extra',
        amount: 289.50,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        date: new Date(2024, 0, 12),
        isPaid: true,
        userId: user.id,
        categoryId: expenseCategories[0].id, // Alimentação
      },
    }),

    prisma.transaction.create({
      data: {
        description: 'Combustível Posto Shell',
        amount: 85.00,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.PIX,
        date: new Date(2024, 0, 8),
        isPaid: true,
        userId: user.id,
        categoryId: expenseCategories[1].id, // Transporte
      },
    }),

    // Boleto
    prisma.transaction.create({
      data: {
        description: 'Conta de Luz - Janeiro',
        amount: 156.30,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.BOLETO,
        date: new Date(2024, 0, 18),
        dueDate: new Date(2024, 0, 25),
        isPaid: false,
        userId: user.id,
        categoryId: expenseCategories[4].id, // Casa
      },
    }),
  ]);

  console.log('💰 Transações criadas:', transactions.length);

  // Criar transação parcelada de exemplo
  const installmentGroupId = `installment_${Date.now()}`;
  const totalAmount = 1200.00;
  const installments = 12;
  const monthlyAmount = totalAmount / installments;

  const installmentTransactions: any[] = [];
  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date(2024, i - 1, 15); // Todo dia 15
    const installment = await prisma.transaction.create({
      data: {
        description: `Notebook Dell - Parcela ${i}/${installments}`,
        amount: monthlyAmount,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        date: new Date(2024, 0, 15),
        dueDate,
        isPaid: i <= 2, // Primeiras 2 parcelas pagas
        isInstallment: true,
        installmentNum: i,
        totalInstallments: installments,
        installmentGroupId,
        interestRate: 1.99,
        originalAmount: totalAmount,
        userId: user.id,
        categoryId: expenseCategories[5].id, // Entretenimento
      },
    });
    installmentTransactions.push(installment);
  }

  console.log('📱 Transações parceladas criadas:', installmentTransactions.length);

  console.log('✅ Seed concluído!');
  console.log('📧 Email: demo@coink.com');
  console.log('🔑 Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
