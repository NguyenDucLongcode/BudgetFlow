import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { RecurringTransactionController } from './recurring-transaction.controller';
import { RecurringTransactionService } from './recurring-transaction.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecurringTransactionController],
  providers: [RecurringTransactionService],
  exports: [RecurringTransactionService],
})
export class RecurringTransactionModule {}
