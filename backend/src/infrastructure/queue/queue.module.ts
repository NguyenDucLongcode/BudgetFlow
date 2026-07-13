import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { QUEUE } from './constants/queue.constants';

import { QueueService } from './queue.service';

import { CleanupScheduler } from './cleanup/cleanup.scheduler';

import { CleanupProcessor } from './cleanup/cleanup.processor';
import { CleanupService } from './cleanup/cleanup.service';
import { EmailModule } from '../email/email.module';
import { EmailQueueService } from './email/email-queue.service';
import { EmailProcessor } from './email/email.processor';

@Global()
@Module({
  imports: [
    ConfigModule,
    EmailModule,
    PrismaModule,

    BullModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB', 0),
        },

        defaultJobOptions: {
          attempts: 3,

          backoff: {
            type: 'exponential',
            delay: 1000,
          },

          removeOnComplete: {
            age: 3600,
          },

          removeOnFail: {
            age: 86400,
          },
        },
      }),
    }),

    // Register queues
    BullModule.registerQueue(
      {
        name: QUEUE.CLEANUP,
      },
      {
        name: QUEUE.EMAIL,
      },
    ),
  ],

  providers: [
    QueueService,

    CleanupService,

    CleanupScheduler,

    CleanupProcessor,

    EmailQueueService, // Add EmailQueueService to the providers array
    EmailProcessor,
  ],

  exports: [QueueService, EmailQueueService],
})
export class QueueModule {}
