import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

import { QUEUE } from './constants/queue.constants';
import { CLEANUP_JOB } from './cleanup/cleanup.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE.CLEANUP)
    private readonly cleanupQueue: Queue,

    // Phase sau
    // @InjectQueue(QUEUE.EMAIL)
    // private readonly emailQueue: Queue,
  ) {}

  /**
   * ==========================================
   * Cleanup Queue
   * ==========================================
   */

  async addCleanupJob(
    jobName: string,
    data: Record<string, any> = {},
    options?: JobsOptions,
  ) {
    return this.cleanupQueue.add(jobName, data, options);
  }

  async addRemoveInactiveUsersJob(days = 30) {
    return this.cleanupQueue.add(
      CLEANUP_JOB.REMOVE_INACTIVE_USERS,
      {
        days,
      },
      {
        removeOnComplete: true,
      },
    );
  }

  /**
   * ==========================================
   * Queue Controls
   * ==========================================
   */

  async pauseCleanupQueue() {
    return this.cleanupQueue.pause();
  }

  async resumeCleanupQueue() {
    return this.cleanupQueue.resume();
  }

  async cleanCleanupQueue() {
    await this.cleanupQueue.drain();
  }

  /**
   * ==========================================
   * Queue Stats
   * ==========================================
   */

  async getCleanupStats() {
    return {
      waiting: await this.cleanupQueue.getWaitingCount(),
      active: await this.cleanupQueue.getActiveCount(),
      delayed: await this.cleanupQueue.getDelayedCount(),
      completed: await this.cleanupQueue.getCompletedCount(),
      failed: await this.cleanupQueue.getFailedCount(),
    };
  }

  /**
   * ==========================================
   * Scheduler
   * ==========================================
   */

  async scheduleDailyCleanup() {
    await this.cleanupQueue.upsertJobScheduler(
      'daily-cleanup',

      {
        pattern: '0 3 * * *',
      },

      {
        name: CLEANUP_JOB.REMOVE_INACTIVE_USERS,
        data: {
          days: 30,
        },
      },
    );
  }
}
