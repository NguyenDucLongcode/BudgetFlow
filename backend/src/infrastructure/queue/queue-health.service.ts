import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class QueueHealthService {
  constructor(private readonly queueService: QueueService) {}

  async getHealth() {
    return {
      cleanup: await this.queueService.getCleanupStats(),
    };
  }
}
