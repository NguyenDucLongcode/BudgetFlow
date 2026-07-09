import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { QUEUE } from './constants/queue.constants';

import { QueueService } from './services/queue.service';
import { QueueHealthService } from './services/queue-health.service';

import { CleanupScheduler } from './schedulers/cleanup.scheduler';

import { CleanupProcessor } from './processors/cleanup.processor';
import { CleanupService } from './services/cleanup.service';

@Global()
@Module({
  imports: [
    ConfigModule,

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

    BullModule.registerQueue({
      name: QUEUE.CLEANUP,
    }),
  ],

  providers: [
    QueueService,

    QueueHealthService,

    CleanupService,

    CleanupScheduler,

    CleanupProcessor,
  ],

  exports: [QueueService, QueueHealthService],
})
export class QueueModule {}
