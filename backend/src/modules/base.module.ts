import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { RecurringTransactionModule } from './recurring-transaction/recurring-transaction.module';
import { GoalModule } from './goal/goal.module';
import { DebtModule } from './debt/debt.module';
import { DebtPaymentModule } from './debt-payment/debt-payment.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';
import { NotificationModule } from './notification/notification.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WalletModule,
    CategoryModule,
    TransactionModule,
    BudgetModule,
    RecurringTransactionModule,
    GoalModule,
    DebtModule,
    DebtPaymentModule,
    UserPreferenceModule,
    NotificationModule,
    TagModule,
  ],
})
export class BaseModule {}
