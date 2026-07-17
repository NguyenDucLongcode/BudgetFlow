import { SeedContext } from './context';
import { DEBT_SEED } from './constants/debt.constant';
import { DebtStatus } from 'generated/prisma/enums';

export async function seedDebts(context: SeedContext): Promise<void> {
  console.log('🌱 Seeding debts...');

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
    const count = await prisma.debt.count({
      where: {
        userId: current.user.id,
      },
    });

    if (count > 0) continue;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 3);

    // Tạo LOANs
    const loans = DEBT_SEED.loans.map((loan) => ({
      userId: current.user.id,
      name: loan.name,
      type: loan.type,
      totalAmount: loan.totalAmount,
      paidAmount: loan.totalAmount * 0.2, // đã trả 20%
      startDate,
      dueDate,
      interestRate: loan.interestRate,
      monthlyPayment: loan.monthlyPayment,
      status: DebtStatus.ACTIVE,
      description: loan.description,
      contactName: loan.contactName,
      walletId: current.wallets[0]?.id,
    }));

    await prisma.debt.createMany({
      data: loans,
    });

    // Tạo DEBTs
    const debts = DEBT_SEED.debts.map((debt) => ({
      userId: current.user.id,
      name: debt.name,
      type: debt.type,
      totalAmount: debt.totalAmount,
      paidAmount: debt.totalAmount * 0.3, // đã trả 30%
      startDate,
      dueDate,
      interestRate: debt.interestRate,
      status: DebtStatus.ACTIVE,
      description: debt.description,
      contactName: debt.contactName,
      borrower: debt.borrower,
      walletId: current.wallets[0]?.id,
    }));

    await prisma.debt.createMany({
      data: debts,
    });
  }

  console.log('✅ Debts seeded');
}
