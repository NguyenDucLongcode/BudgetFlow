import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { RecurringTransactionController } from './recurring-transaction.controller';
import { RecurringTransactionService } from './recurring-transaction.service';
import { RecurringCronService } from './recurring-cron.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [RecurringTransactionController],
  providers: [RecurringTransactionService, RecurringCronService],
  exports: [RecurringTransactionService],
})
export class RecurringTransactionModule {}
