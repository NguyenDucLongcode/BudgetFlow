import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CLEANUP_JOB, CLEANUP_QUEUE } from './cleanup.constants';
import { CleanupService } from './cleanup.service';

@Processor(CLEANUP_QUEUE)
export class CleanupProcessor extends WorkerHost {
  constructor(private readonly cleanupService: CleanupService) {
    super();
  }

  // This method is called when a job is added to the queue. It processes the job based on its name and calls the appropriate method in the CleanupService.
  async process(job: Job) {
    switch (job.name) {
      case CLEANUP_JOB.REMOVE_INACTIVE_USERS:
        return this.cleanupService.removeInactiveUsers();
    }
  }
}
