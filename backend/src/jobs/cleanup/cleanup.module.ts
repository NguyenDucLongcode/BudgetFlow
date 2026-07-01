import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/prisma/prisma.module';

import { CLEANUP_QUEUE } from './cleanup.constants';
import { CleanupProcessor } from './cleanup.processor';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [
    PrismaModule,

    BullModule.registerQueue({
      name: CLEANUP_QUEUE,
    }),
  ],

  providers: [CleanupProcessor, CleanupService],

  exports: [CleanupService],
})
export class CleanupModule {}
