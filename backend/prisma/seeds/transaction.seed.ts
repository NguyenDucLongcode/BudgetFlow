import { SeedContext } from './context';
import { TRANSACTION_SEED } from './constants/transaction.constant';
import { TransactionStatus, TransactionType } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/browser';

export async function seedTransactions(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding transactions...');

  const prisma = context.prisma;

  const users = [
    {
      user: context.users.admin!,
      wallets: context.wallets.admin,
      categories: context.categories.admin,
    },
    {
      user: context.users.user!,
      wallets: context.wallets.user,
      categories: context.categories.user,
    },
  ];

  for (const current of users) {
    /**
     * Để chạy nhiều lần không bị duplicate
     */
    const count = await prisma.transaction.count({
      where: {
        userId: current.user.id,
      },
    });

    if (count > 0) continue;

    /**
     * Income
     */
    for (const item of TRANSACTION_SEED.incomes) {
      const category = current.categories.find(
        (c) => c.nameVi === item.category || c.nameEn === item.category,
      );

      await prisma.transaction.create({
        data: {
          userId: current.user.id,

          walletId: current.wallets[0].id,

          categoryId: category?.id,

          type: TransactionType.INCOME,

          amount: new Prisma.Decimal(item.amount),

          currency: TRANSACTION_SEED.currency,

          description: item.description,

          status: TransactionStatus.COMPLETED,

          date: randomDate(),
        },
      });
    }

    /**
     * Expense
     */
    for (let i = 0; i < 35; i++) {
      const item =
        TRANSACTION_SEED.expenses[
          Math.floor(Math.random() * TRANSACTION_SEED.expenses.length)
        ];

      const wallet =
        current.wallets[Math.floor(Math.random() * current.wallets.length)];

      const category = current.categories.find(
        (c) => c.nameVi === item.category || c.nameEn === item.category,
      );

      const status =
        TRANSACTION_SEED.status[
          Math.floor(Math.random() * TRANSACTION_SEED.status.length)
        ];

      await prisma.transaction.create({
        data: {
          userId: current.user.id,

          walletId: wallet.id,

          categoryId: category?.id,

          type: TransactionType.EXPENSE,

          amount: new Prisma.Decimal(item.amount),

          currency: TRANSACTION_SEED.currency,

          description: item.description,

          status,

          date: randomDate(),
        },
      });
    }

    /**
     * Transfer
     */
    if (current.wallets.length >= 2) {
      for (let i = 0; i < 5; i++) {
        const from = current.wallets[0];
        const to = current.wallets[1];

        const amount =
          TRANSACTION_SEED.transferAmount[
            Math.floor(Math.random() * TRANSACTION_SEED.transferAmount.length)
          ];

        await prisma.transaction.create({
          data: {
            userId: current.user.id,

            type: TransactionType.TRANSFER,

            amount: new Prisma.Decimal(amount),

            currency: TRANSACTION_SEED.currency,

            fromWalletId: from.id,

            toWalletId: to.id,

            status: TransactionStatus.COMPLETED,

            description: 'Chuyển tiền giữa các ví',

            date: randomDate(),
          },
        });
      }
    }
  }

  console.log('✅ Transactions seeded');
}

function randomDate(): Date {
  const now = new Date();

  const days = Math.floor(Math.random() * 90);

  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
