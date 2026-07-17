import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';

import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { TransactionService } from './services/transaction.service';
import { TransactionTagService } from './services/transaction-tag.service';
import { TransactionAttachmentService } from './services/transaction.attachment.service';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionTagService,
    TransactionAttachmentService,
  ],
  exports: [
    TransactionService,
    TransactionTagService,
    TransactionAttachmentService,
  ],
})
export class TransactionModule {}
