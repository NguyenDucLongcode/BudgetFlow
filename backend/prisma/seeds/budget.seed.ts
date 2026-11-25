import { SeedContext } from './context';
import { BUDGET_SEED } from './constants/budget.constant';
import { Prisma } from 'generated/prisma/client';

export async function seedBudgets(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding budgets...');

  const prisma = context.prisma;

  const users = [
    {
      user: context.users.admin!,
      categories: context.categories.admin,
    },
    {
      user: context.users.user!,
      categories: context.categories.user,
    },
  ];

  for (const current of users) {
    const count = await prisma.budget.count({
      where: {
        userId: current.user.id,
      },
    });

    if (count > 0) continue;

    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    const budgets = BUDGET_SEED.budgets
      .map((budget) => {
        const category = current.categories.find(
          (c) =>
            (c.nameVi === budget.categoryName ||
              c.nameEn === budget.categoryName) &&
            c.type === 'EXPENSE',
        );

        if (!category) {
          console.warn(
            `⚠️  Category "${budget.categoryName}" not found, skipping`,
          );
          return null;
        }

        return {
          userId: current.user.id,
          categoryId: category.id,
          amount: new Prisma.Decimal(budget.amount),
          spent: new Prisma.Decimal(0),
          startDate,
          endDate,
          period: budget.period,
          type: budget.type,
          alertThreshold: new Prisma.Decimal(budget.alertThreshold || 0),
          isAlertEnabled: budget.isAlertEnabled,
          description: budget.description,
          isActive: true,
        };
      })
      .filter((budget) => budget !== null);

    if (budgets.length > 0) {
      await prisma.budget.createMany({
        data: budgets,
      });
    }
  }

  console.log('✅ Budgets seeded');
}
