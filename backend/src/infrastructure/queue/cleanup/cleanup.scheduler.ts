import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../queue.service';

@Injectable()
export class CleanupScheduler implements OnModuleInit {
  private readonly logger = new Logger(CleanupScheduler.name);

  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    await this.queueService.scheduleDailyCleanup();

    this.logger.log(
      '✅ Daily cleanup scheduler registered (03:00 AM every day)',
    );
  }
}
