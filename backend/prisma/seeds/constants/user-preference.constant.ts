import { Currency, LanguageCode } from 'generated/prisma/enums';

export const USER_PREFERENCE_SEED = {
  ADMIN: {
    language: LanguageCode.EN,
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
    language: LanguageCode.VI,
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
