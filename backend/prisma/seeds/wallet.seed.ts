import { DEFAULT_WALLETS } from './constants/wallets..constant';
import { SeedContext } from './context';

export async function seedWallets(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding wallets...');

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
    // Query một lần
    const existedWallets = await prisma.wallet.findMany({
      where: {
        userId: current.user.id,
      },
    });

    const existedNames = new Set(existedWallets.map((wallet) => wallet.nameVi));

    const walletsToCreate = DEFAULT_WALLETS.filter(
      (wallet) => !existedNames.has(wallet.nameVi),
    ).map((wallet) => ({
      ...wallet,
      userId: current.user.id,
    }));

    if (walletsToCreate.length > 0) {
      await prisma.wallet.createMany({
        data: walletsToCreate,
      });
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: current.user.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    context.wallets[current.key] = wallets;
  }

  console.log('✅ Wallets seeded');
}
