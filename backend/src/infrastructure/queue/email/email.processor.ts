import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from 'src/infrastructure/email/email.service';
import { Logger } from '@nestjs/common';
import { QUEUE } from '../constants/queue.constants';
import { EMAIL_JOB } from './email-job.constants';
import { EmailJobData } from './ email-job.interface';

@Processor(QUEUE.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    const { to, name, verifyUrl, resetUrl } = job.data;

    this.logger.log(`Processing email job: ${job.name} for ${to}`);

    switch (job.name) {
      case EMAIL_JOB.SEND_VERIFICATION:
        return this.emailService.sendVerificationEmail(to, name, verifyUrl!);

      case EMAIL_JOB.SEND_RESET_PASSWORD:
        return this.emailService.sendResetPasswordEmail(to, name, resetUrl!);

      case EMAIL_JOB.SEND_WELCOME:
        return this.emailService.sendWelcomeEmail(to, name);

      default:
        throw new Error(`Unknown email job: ${job.name}`);
    }
  }
}
