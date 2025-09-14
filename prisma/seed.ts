// prisma/seed.ts
import { PrismaClient, Role, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash the common password
  const password = await bcrypt.hash('password', 10);

  // Create Tenants
  const acme = await prisma.tenant.create({
    data: {
      name: 'Acme',
      slug: 'acme',
      plan: Plan.FREE,
    },
  });

  const globex = await prisma.tenant.create({
    data: {
      name: 'Globex',
      slug: 'globex',
      plan: Plan.FREE,
    },
  });

  // Create Users for Acme
  await prisma.user.create({
    data: {
      email: 'admin@acme.test',
      password,
      role: Role.ADMIN,
      tenantId: acme.id,
    },
  });
  await prisma.user.create({
    data: {
      email: 'user@acme.test',
      password,
      role: Role.MEMBER,
      tenantId: acme.id,
    },
  });

  // Create Users for Globex
  await prisma.user.create({
    data: {
      email: 'admin@globex.test',
      password,
      role: Role.ADMIN,
      tenantId: globex.id,
    },
  });
   await prisma.user.create({
    data: {
      email: 'user@globex.test',
      password,
      role: Role.MEMBER,
      tenantId: globex.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });