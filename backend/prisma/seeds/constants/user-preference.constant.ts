import { Currency } from 'generated/prisma/enums';

export const USER_PREFERENCE_SEED = {
  ADMIN: {
    language: 'en',
    currency: Currency.USD,
    theme: 'dark',

    weekStartsOn: 0,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    budgetNotification: true,
    goalNotification: true,
    debtNotification: true,
    recurringNotification: true,
  },

  USER: {
    language: 'vi',
    currency: Currency.VND,
    theme: 'system',

    weekStartsOn: 1,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    budgetNotification: true,
    goalNotification: true,
    debtNotification: false,
    recurringNotification: true,
  },
} as const;
