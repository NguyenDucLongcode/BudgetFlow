import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { runSeeds } from './seeds';
import { PrismaClient } from 'generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await runSeeds(prisma);

  console.log('');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
