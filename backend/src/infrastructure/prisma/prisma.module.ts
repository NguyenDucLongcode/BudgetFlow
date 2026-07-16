import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  CategoryRepository,
  WalletRepository,
  UserRepository,
  SessionRepository,
  TransactionRepository,
  BudgetRepository,
  RecurringTransactionRepository,
  GoalRepository,
  DebtRepository,
  DebtPaymentRepository,
} from './repositories';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    SessionRepository,
    WalletRepository,
    CategoryRepository,
    TransactionRepository,
    BudgetRepository,
    RecurringTransactionRepository,
    GoalRepository,
    DebtRepository,
    DebtPaymentRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    SessionRepository,
    WalletRepository,
    CategoryRepository,
    TransactionRepository,
    BudgetRepository,
    RecurringTransactionRepository,
    GoalRepository,
    DebtRepository,
    DebtPaymentRepository,
  ],
})
export class PrismaModule {}
