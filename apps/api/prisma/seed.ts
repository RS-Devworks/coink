import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Verificar se já existe um usuário admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@coink.com' },
  });

  if (existingAdmin) {
    console.log('👤 Admin user already exists');
    return;
  }

  // Criar hash da senha do admin
  const saltRounds = 12;
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@coink.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:');
  console.log(`   📧 Email: ${admin.email}`);
  console.log(`   🔑 Password: ${adminPassword}`);
  console.log(`   🆔 ID: ${admin.id}`);

  // Criar alguns usuários de exemplo
  const exampleUsers = [
    {
      name: 'João Silva',
      email: 'joao@example.com',
      password: await bcrypt.hash('senha123', saltRounds),
    },
    {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: await bcrypt.hash('senha123', saltRounds),
    },
  ];

  for (const userData of exampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`👤 Example user created: ${user.email}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
