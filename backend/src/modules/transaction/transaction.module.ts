import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';

import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionService } from './services/transaction.service';
import { TransactionTagService } from './services/transaction-tag.service';
import { TransactionAttachmentService } from './services/transaction.attachment.service';
import { TransactionCronService } from './services/transaction-cron.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionTagService,
    TransactionAttachmentService,
    TransactionCronService,
  ],
  exports: [
    TransactionService,
    TransactionTagService,
    TransactionAttachmentService,
    TransactionCronService,
  ],
})
export class TransactionModule {}
