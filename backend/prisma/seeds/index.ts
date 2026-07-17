import { PrismaClient } from 'generated/prisma/client';
import { seedUsers } from './user.seed';
import { seedCategories } from './category.seed';
import { seedWallets } from './wallet.seed';
import { seedTransactions } from './transaction.seed';
import { seedBudgets } from './budget.seed';
import { seedGoals } from './goal.seed';
import { seedDebts } from './debt.seed';
import { seedTags } from './tag.seed';
import { createSeedContext } from './context';

export async function runSeeds(prisma: PrismaClient) {
  console.log('==========================');
  console.log('🚀 START SEEDING DATABASE');
  console.log('==========================');

  const context = createSeedContext(prisma);

  // 1. Users
  await seedUsers(context);

  // 2. Categories (phụ thuộc users)
  await seedCategories(context);

  // 3. Wallets (phụ thuộc users)
  await seedWallets(context);

  // 4. Tags (phụ thuộc users)
  await seedTags(context);

  // 5. Transactions (phụ thuộc wallets, categories, users)
  await seedTransactions(context);

  // 6. Budgets (phụ thuộc categories, users)
  await seedBudgets(context);

  // 7. Goals (phụ thuộc wallets, users)
  await seedGoals(context);

  // 8. Debts (phụ thuộc wallets, users)
  await seedDebts(context);

  console.log('==========================');
  console.log('🎉 ALL SEEDS COMPLETED!');
  console.log('==========================');
}
