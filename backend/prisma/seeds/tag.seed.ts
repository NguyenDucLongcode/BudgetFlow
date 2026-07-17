import { SeedContext } from './context';
import { TAG_SEED } from './constants/tag.constant';

export async function seedTags(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding tags...');

  const prisma = context.prisma;

  const users = [
    {
      user: context.users.admin!,
    },
    {
      user: context.users.user!,
    },
  ];

  for (const current of users) {
    const count = await prisma.tag.count({
      where: {
        userId: current.user.id,
      },
    });

    if (count > 0) continue;

    const tags = TAG_SEED.tags.map((tag) => ({
      userId: current.user.id,
      name: tag.name,
      color: tag.color,
      icon: tag.icon,
    }));

    await prisma.tag.createMany({
      data: tags,
    });
  }

  console.log('✅ Tags seeded');
}
