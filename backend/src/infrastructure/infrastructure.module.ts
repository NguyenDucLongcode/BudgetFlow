import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EmailModule, RedisModule, QueueModule, PrismaModule],
})
export class InfrastructureModule {}
