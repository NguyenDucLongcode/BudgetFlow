import { SeedContext } from './context';
import { SYSTEM_CATEGORIES } from './constants/category.constant';

export async function seedCategories(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding categories...');

  const prisma = context.prisma;

  const users = [
    {
      key: 'admin' as const,
      user: context.users.admin!,
    },
    {
      key: 'user' as const,
      user: context.users.user!,
    },
  ];

  for (const current of users) {
    /**
     * Query một lần
     */
    const existedCategories = await prisma.category.findMany({
      where: {
        userId: current.user.id,
      },
      select: {
        name: true,
        type: true,
      },
    });

    const existedSet = new Set(
      existedCategories.map((category) => `${category.type}-${category.name}`),
    );

    const categoriesToCreate = SYSTEM_CATEGORIES.filter(
      (category) => !existedSet.has(`${category.type}-${category.name}`),
    ).map((category) => ({
      ...category,
      userId: current.user.id,
      isSystem: true,
    }));

    if (categoriesToCreate.length > 0) {
      await prisma.category.createMany({
        data: categoriesToCreate,
      });
    }

    /**
     * Quan trọng
     * Lưu category vào context
     */
    context.categories[current.key] = await prisma.category.findMany({
      where: {
        userId: current.user.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  console.log('✅ Categories seeded');
}
