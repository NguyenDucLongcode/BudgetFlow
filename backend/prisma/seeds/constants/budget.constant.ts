import { BudgetPeriod, BudgetType } from 'generated/prisma/enums';

export const BUDGET_SEED = {
  budgets: [
    {
      categoryName: 'Ăn uống',
      amount: 3000000,
      period: BudgetPeriod.MONTHLY,
      type: BudgetType.SPENDING,
      alertThreshold: 0.8,
      isAlertEnabled: true,
      description: 'Chi tiêu ăn uống hàng tháng',
    },
    {
      categoryName: 'Mua sắm',
      amount: 2000000,
      period: BudgetPeriod.MONTHLY,
      type: BudgetType.SPENDING,
      alertThreshold: 0.9,
      isAlertEnabled: true,
      description: 'Mua sắm cá nhân',
    },
    {
      categoryName: 'Di chuyển',
      amount: 1500000,
      period: BudgetPeriod.MONTHLY,
      type: BudgetType.SPENDING,
      alertThreshold: 0.75,
      isAlertEnabled: true,
      description: 'Chi phí di chuyển, xăng xe',
    },
    {
      categoryName: 'Giải trí',
      amount: 1000000,
      period: BudgetPeriod.MONTHLY,
      type: BudgetType.SPENDING,
      alertThreshold: 0.85,
      isAlertEnabled: false,
      description: 'Giải trí, xem phim, game',
    },
  ],
} as const;
