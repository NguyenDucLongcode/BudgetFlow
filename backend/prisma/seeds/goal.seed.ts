import { SeedContext } from './context';
import { GOAL_SEED } from './constants/goal.constant';
import { GoalStatus } from 'generated/prisma/enums';

export async function seedGoals(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding goals...');

  const prisma = context.prisma;

  const users = [
    {
      user: context.users.admin!,
      wallets: context.wallets.admin,
    },
    {
      user: context.users.user!,
      wallets: context.wallets.user,
    },
  ];

  for (const current of users) {
    const count = await prisma.goal.count({
      where: {
        userId: current.user.id,
      },
    });

    if (count > 0) continue;

    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 6); // 6 tháng sau

    const goals = GOAL_SEED.goals.map((goal, index) => {
      const savedPercent = [0.3, 0.1, 0.5][index % 3];
      const savedAmount = goal.targetAmount * savedPercent;

      return {
        userId: current.user.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: savedAmount,
        startDate,
        targetDate,
        status: GoalStatus.IN_PROGRESS,
        priority: goal.priority,
        description: goal.description,
        notes: goal.notes,
        icon: goal.icon,
        color: goal.color,
        walletId: current.wallets[0]?.id,
        isArchived: false,
      };
    });

    await prisma.goal.createMany({
      data: goals,
    });
  }

  console.log('✅ Goals seeded');
}
