import { MongoAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { User, Wallet } from 'generated/prisma/client';
import { Action } from './actions.enum';
import {
  Budget,
  Category,
  Debt,
  DebtPayment,
  Goal,
  RecurringTransaction,
  Transaction,
} from 'generated/prisma/browser';

export type AppSubjects =
  | Subjects<{
      User: User;
      Wallet: Wallet;
      Category: Category;
      Transaction: Transaction;
      Budget: Budget;
      RecurringTransaction: RecurringTransaction;
      Goal: Goal;
      Debt: Debt;
      DebtPayment: DebtPayment;
    }>
  | 'all';

export type AppAbility = MongoAbility<[Action, AppSubjects], PrismaQuery>;
