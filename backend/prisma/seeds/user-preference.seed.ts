import { SeedContext } from './context';
import { USER_PREFERENCE_SEED } from './constants/user-preference.constant';

export async function seedUserPreferences(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding user preferences...');

  const prisma = context.prisma;

  const preferences = [
    {
      user: context.users.admin!,
      data: USER_PREFERENCE_SEED.ADMIN,
    },
    {
      user: context.users.user!,
      data: USER_PREFERENCE_SEED.USER,
    },
  ];

  for (const current of preferences) {
    const exists = await prisma.userPreference.findUnique({
      where: {
        userId: current.user.id,
      },
    });

    if (exists) continue;

    await prisma.userPreference.create({
      data: {
        userId: current.user.id,
        ...current.data,
      },
    });
  }

  console.log('✅ User preferences seeded');
}
