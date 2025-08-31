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

  console.log('💰 Criando transações abrangentes para dashboard completo...');

  // Função helper para criar transações de um mês específico
  const createMonthlyTransactions = async (monthIndex: number, year: number = 2024) => {
    const transactions = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Se estamos no futuro, incluir parcelas e assinaturas
    const isCurrentOrPastMonth = year < currentYear || (year === currentYear && monthIndex <= currentMonth);

    // Receitas mensais (Salário sempre no dia 5)
    transactions.push(
      prisma.transaction.create({
        data: {
          description: `Salário ${monthIndex + 1}/${year}`,
          amount: 4500.00 + (Math.random() * 200 - 100), // Variação de ±100
          type: TransactionType.INCOME,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          date: new Date(year, monthIndex, 5),
          dueDate: new Date(year, monthIndex, 5),
          isPaid: isCurrentOrPastMonth,
          isRecurring: true,
          recurringDay: 5,
          userId: user.id,
          categoryId: incomeCategories[0].id, // Salário
        },
      })
    );

    // Freelance ocasional (30% chance por mês)
    if (Math.random() < 0.3) {
      transactions.push(
        prisma.transaction.create({
          data: {
            description: `Projeto Freelance - ${monthIndex + 1}/${year}`,
            amount: 800 + Math.random() * 1200, // Entre 800-2000
            type: TransactionType.INCOME,
            paymentMethod: PaymentMethod.PIX,
            date: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            dueDate: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            isPaid: isCurrentOrPastMonth,
            userId: user.id,
            categoryId: incomeCategories[1].id, // Freelance
          },
        })
      );
    }

    // Assinaturas mensais (sempre recorrentes)
    const subscriptions = [
      { name: 'Netflix Premium', amount: 45.90, day: 10 },
      { name: 'Spotify Individual', amount: 21.90, day: 15 },
      { name: 'Amazon Prime', amount: 14.90, day: 8 },
      { name: 'Microsoft 365', amount: 32.00, day: 20 },
      { name: 'Adobe Creative', amount: 89.90, day: 12 },
    ];

    for (const sub of subscriptions) {
      transactions.push(
        prisma.transaction.create({
          data: {
            description: sub.name,
            amount: sub.amount,
            type: TransactionType.EXPENSE,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            date: new Date(year, monthIndex, sub.day),
            dueDate: new Date(year, monthIndex, sub.day + 5),
            isPaid: isCurrentOrPastMonth,
            isRecurring: true,
            recurringDay: sub.day,
            userId: user.id,
            categoryId: expenseCategories[2].id, // Assinaturas
          },
        })
      );
    }

    // Despesas de casa (contas básicas)
    const houseBills = [
      { name: 'Conta de Luz', amount: 140 + Math.random() * 60, day: 18 },
      { name: 'Conta de Água', amount: 80 + Math.random() * 40, day: 22 },
      { name: 'Internet Fibra', amount: 99.90, day: 12 },
      { name: 'Gás de Cozinha', amount: 110, day: Math.floor(Math.random() * 28) + 1 },
    ];

    for (const bill of houseBills) {
      // Gás é ocasional (20% chance)
      if (bill.name === 'Gás de Cozinha' && Math.random() > 0.2) continue;
      
      transactions.push(
        prisma.transaction.create({
          data: {
            description: `${bill.name} - ${monthIndex + 1}/${year}`,
            amount: bill.amount,
            type: TransactionType.EXPENSE,
            paymentMethod: PaymentMethod.BOLETO,
            date: new Date(year, monthIndex, bill.day),
            dueDate: new Date(year, monthIndex, bill.day + 7),
            isPaid: isCurrentOrPastMonth && Math.random() > 0.1, // 90% chance de estar pago se for mês passado
            userId: user.id,
            categoryId: expenseCategories[4].id, // Casa
          },
        })
      );
    }

    // Alimentação (supermercado + restaurantes)
    const foodExpenses = [];
    // Supermercado (2-3 vezes por mês)
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      foodExpenses.push({
        description: ['Supermercado Extra', 'Pão de Açúcar', 'Carrefour'][Math.floor(Math.random() * 3)],
        amount: 150 + Math.random() * 200,
        method: PaymentMethod.DEBIT_CARD,
      });
    }
    // Restaurantes (3-6 vezes por mês)
    for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
      foodExpenses.push({
        description: ['Restaurante do João', 'iFood - Pizza', 'Lanchonete Central', 'Padaria São Bento'][Math.floor(Math.random() * 4)],
        amount: 25 + Math.random() * 75,
        method: [PaymentMethod.PIX, PaymentMethod.DEBIT_CARD, PaymentMethod.CREDIT_CARD][Math.floor(Math.random() * 3)],
      });
    }

    for (const food of foodExpenses) {
      transactions.push(
        prisma.transaction.create({
          data: {
            description: food.description,
            amount: food.amount,
            type: TransactionType.EXPENSE,
            paymentMethod: food.method,
            date: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            dueDate: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            isPaid: isCurrentOrPastMonth,
            userId: user.id,
            categoryId: expenseCategories[0].id, // Alimentação
          },
        })
      );
    }

    // Transporte (combustível, Uber, etc.)
    const transportExpenses = [];
    // Combustível (2-4 vezes por mês)
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      transportExpenses.push({
        description: ['Shell', 'Posto Ipiranga', 'BR Distribuidora'][Math.floor(Math.random() * 3)],
        amount: 70 + Math.random() * 40,
        method: [PaymentMethod.PIX, PaymentMethod.DEBIT_CARD][Math.floor(Math.random() * 2)],
      });
    }
    // Uber/transporte público
    for (let i = 0; i < Math.floor(Math.random() * 8); i++) {
      transportExpenses.push({
        description: ['Uber', '99Pop', 'Bilhete Único'][Math.floor(Math.random() * 3)],
        amount: 15 + Math.random() * 35,
        method: [PaymentMethod.PIX, PaymentMethod.CREDIT_CARD][Math.floor(Math.random() * 2)],
      });
    }

    for (const transport of transportExpenses) {
      transactions.push(
        prisma.transaction.create({
          data: {
            description: transport.description,
            amount: transport.amount,
            type: TransactionType.EXPENSE,
            paymentMethod: transport.method,
            date: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            dueDate: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
            isPaid: isCurrentOrPastMonth,
            userId: user.id,
            categoryId: expenseCategories[1].id, // Transporte
          },
        })
      );
    }

    // Saúde (ocasional)
    if (Math.random() < 0.4) {
      const healthExpenses = [
        { name: 'Consulta Médica', amount: 120 + Math.random() * 80 },
        { name: 'Farmácia', amount: 30 + Math.random() * 70 },
        { name: 'Exames Laboratoriais', amount: 80 + Math.random() * 120 },
      ];
      
      for (const health of healthExpenses.slice(0, Math.floor(Math.random() * 2) + 1)) {
        transactions.push(
          prisma.transaction.create({
            data: {
              description: health.name,
              amount: health.amount,
              type: TransactionType.EXPENSE,
              paymentMethod: [PaymentMethod.CREDIT_CARD, PaymentMethod.PIX][Math.floor(Math.random() * 2)],
              date: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
              dueDate: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
              isPaid: isCurrentOrPastMonth,
              userId: user.id,
              categoryId: expenseCategories[3].id, // Saúde
            },
          })
        );
      }
    }

    // Entretenimento
    if (Math.random() < 0.6) {
      const entertainmentExpenses = [
        { name: 'Cinema', amount: 25 + Math.random() * 20 },
        { name: 'Livros', amount: 40 + Math.random() * 60 },
        { name: 'Teatro', amount: 80 + Math.random() * 120 },
        { name: 'Bar com amigos', amount: 60 + Math.random() * 80 },
        { name: 'Steam - Jogos', amount: 30 + Math.random() * 70 },
      ];
      
      for (const entertainment of entertainmentExpenses.slice(0, Math.floor(Math.random() * 3) + 1)) {
        transactions.push(
          prisma.transaction.create({
            data: {
              description: entertainment.name,
              amount: entertainment.amount,
              type: TransactionType.EXPENSE,
              paymentMethod: [PaymentMethod.CREDIT_CARD, PaymentMethod.PIX, PaymentMethod.DEBIT_CARD][Math.floor(Math.random() * 3)],
              date: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
              dueDate: new Date(year, monthIndex, Math.floor(Math.random() * 28) + 1),
              isPaid: isCurrentOrPastMonth,
              userId: user.id,
              categoryId: expenseCategories[5].id, // Entretenimento
            },
          })
        );
      }
    }

    return await Promise.all(transactions);
  };

  // Criar transações para os últimos 8 meses + próximos 4 meses (incluindo parcelas futuras)
  let totalTransactions = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Últimos 8 meses
  for (let i = -8; i <= 4; i++) {
    const date = new Date(currentYear, currentMonth + i, 1);
    const monthTransactions = await createMonthlyTransactions(date.getMonth(), date.getFullYear());
    totalTransactions = [...totalTransactions, ...monthTransactions];
  }

  console.log('💰 Transações mensais criadas:', totalTransactions.length);

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
