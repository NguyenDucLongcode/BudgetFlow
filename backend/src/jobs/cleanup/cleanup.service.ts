import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { CLEANUP_JOB, CLEANUP_QUEUE } from './cleanup.constants';

@Injectable()
export class CleanupService implements OnModuleInit {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,

    @InjectQueue(CLEANUP_QUEUE)
    private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      CLEANUP_JOB.REMOVE_INACTIVE_USERS,
      {
        pattern: '0 3 * * *', // 03:00 mỗi ngày
      },
      {
        name: CLEANUP_JOB.REMOVE_INACTIVE_USERS,
      },
    );
  }

  // XÓa tất cả người dùng không hoạt động (isActive = false) và có verifyTokenExpiresAt < thời gian hiện tại
  async removeInactiveUsers() {
    const result = await this.prisma.user.deleteMany({
      where: {
        isActive: false,
        verifyTokenExpiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Deleted ${result.count} inactive users.`);
  }
}
