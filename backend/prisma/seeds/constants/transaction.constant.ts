import {
  Currency,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/enums';

export const TRANSACTION_SEED = {
  incomes: [
    {
      description: 'Lương tháng',
      amount: 15000000,
      category: 'Lương',
    },
    {
      description: 'Thưởng KPI',
      amount: 3000000,
      category: 'Thưởng',
    },
    {
      description: 'Bán đồ cũ',
      amount: 1200000,
      category: 'Khác',
    },
    {
      description: 'Freelancer',
      amount: 4500000,
      category: 'Kinh doanh',
    },
  ],

  expenses: [
    {
      description: 'Ăn sáng',
      amount: 45000,
      category: 'Ăn uống',
    },
    {
      description: 'Cafe',
      amount: 65000,
      category: 'Ăn uống',
    },
    {
      description: 'Grab',
      amount: 120000,
      category: 'Di chuyển',
    },
    {
      description: 'Siêu thị',
      amount: 680000,
      category: 'Mua sắm',
    },
    {
      description: 'Tiền điện',
      amount: 450000,
      category: 'Hóa đơn',
    },
    {
      description: 'Netflix',
      amount: 220000,
      category: 'Giải trí',
    },
    {
      description: 'Mua sách',
      amount: 350000,
      category: 'Giáo dục',
    },
    {
      description: 'Khám bệnh',
      amount: 800000,
      category: 'Sức khỏe',
    },
  ],

  transferAmount: [500000, 1000000, 2000000, 5000000],

  currency: Currency.VND,

  status: [
    TransactionStatus.COMPLETED,
    TransactionStatus.COMPLETED,
    TransactionStatus.COMPLETED,
    TransactionStatus.COMPLETED,
    TransactionStatus.PENDING,
    TransactionStatus.FAILED,
  ],

  type: TransactionType,
};
