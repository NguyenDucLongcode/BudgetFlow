import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { QUEUE } from '../constants/queue.constants';
import { CleanupService } from '../services/cleanup.service';

@Processor(QUEUE.CLEANUP, {
  concurrency: 1,
})
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(private readonly cleanupService: CleanupService) {
    super();
  }

  async process(job: Job<{ days: number }>) {
    this.logger.debug(`Processing cleanup job (${job.name})`);

    return this.cleanupService.removeInactiveUsers(job.data.days);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`▶ Job started: ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Job completed: ${job.name}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Job failed: ${job.name}`, error.stack);
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(error.message);
  }
}
