import { TransactionType } from 'generated/prisma/enums';

export const TRANSACTION = {
  // Số tiền tối thiểu
  MIN_AMOUNT: 0.01,

  // Số tiền tối đa
  MAX_AMOUNT: 999999999999.99,

  // Mô tả mặc định cho các loại giao dịch
  DEFAULT_DESCRIPTIONS: {
    [TransactionType.INCOME]: 'Thu nhập',
    [TransactionType.EXPENSE]: 'Chi tiêu',
    [TransactionType.TRANSFER]: 'Chuyển khoản',
  },
} as const;
