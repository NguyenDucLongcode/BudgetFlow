import { Currency, WalletType } from 'generated/prisma/enums';

export const DEFAULT_WALLETS = [
  {
    name: 'Ví tiền mặt',
    type: WalletType.CASH,
    currency: Currency.VND,
    initialBalance: 2_000_000,
    balance: 2_000_000,
    icon: '💵',
    color: '#22C55E',
    isDefault: true,
    autoSync: false,
    description: 'Ví tiền mặt hằng ngày',
  },

  {
    name: 'Vietcombank',
    type: WalletType.BANK,
    currency: Currency.VND,
    initialBalance: 15_000_000,
    balance: 15_000_000,
    icon: '🏦',
    color: '#2563EB',
    bankName: 'Vietcombank',
    accountNumber: '0123456789',
    accountName: 'Nguyen Van A',
    autoSync: true,
    description: 'Tài khoản ngân hàng chính',
  },

  {
    name: 'MoMo',
    type: WalletType.E_WALLET,
    currency: Currency.VND,
    initialBalance: 800_000,
    balance: 800_000,
    icon: '📱',
    color: '#EC4899',
    autoSync: false,
    description: 'Ví điện tử MoMo',
  },
] as const;
