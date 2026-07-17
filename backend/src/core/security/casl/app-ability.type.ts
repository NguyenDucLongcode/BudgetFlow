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
  Notification,
  RecurringTransaction,
  Tag,
  Transaction,
  UserPreference,
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
      UserPreference: UserPreference;
      Notification: Notification;
      Tag: Tag;
    }>
  | 'all';

export type AppAbility = MongoAbility<[Action, AppSubjects], PrismaQuery>;
