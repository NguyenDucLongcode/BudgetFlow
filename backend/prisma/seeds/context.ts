import { Category, User, Wallet } from 'generated/prisma/browser';
import { PrismaClient } from 'generated/prisma/client';

export interface SeedContext {
  prisma: PrismaClient;

  users: {
    admin?: User;
    user?: User;
  };

  wallets: {
    admin: Wallet[];
    user: Wallet[];
  };

  categories: {
    admin: Category[];
    user: Category[];
  };
}

export function createSeedContext(prisma: PrismaClient): SeedContext {
  return {
    prisma,

    users: {},

    wallets: {
      admin: [],
      user: [],
    },

    categories: {
      admin: [],
      user: [],
    },
  };
}
