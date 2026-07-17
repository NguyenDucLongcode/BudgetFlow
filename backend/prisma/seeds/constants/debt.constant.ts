import { DebtStatus, DebtType } from 'generated/prisma/enums';

export const DEBT_SEED = {
  loans: [
    {
      name: 'Vay mua xe máy',
      type: DebtType.LOAN,
      totalAmount: 20000000,
      interestRate: 0.08,
      monthlyPayment: 1800000,
      description: 'Vay mua xe máy Honda Vision',
      contactName: 'Ngân hàng VPBank',
      status: DebtStatus.ACTIVE,
    },
    {
      name: 'Vay học phí',
      type: DebtType.LOAN,
      totalAmount: 15000000,
      interestRate: 0.06,
      monthlyPayment: 1500000,
      description: 'Vay học phí cho khóa học tiếng Anh',
      contactName: 'Trung tâm Anh ngữ',
      status: DebtStatus.ACTIVE,
    },
  ],
  debts: [
    {
      name: 'Cho bạn mượn tiền',
      type: DebtType.DEBT,
      totalAmount: 5000000,
      interestRate: 0,
      description: 'Cho bạn mượn tiền gấp',
      contactName: 'Nguyễn Văn B',
      borrower: 'Bạn thân',
      status: DebtStatus.ACTIVE,
    },
    {
      name: 'Bán hàng online',
      type: DebtType.DEBT,
      totalAmount: 3000000,
      interestRate: 0,
      description: 'Khách hàng chưa thanh toán',
      contactName: 'Khách hàng A',
      borrower: 'Shop online',
      status: DebtStatus.ACTIVE,
    },
  ],
} as const;
