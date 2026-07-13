import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QUEUE } from '../constants/queue.constants';
import { EMAIL_JOB } from './email-job.constants';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(QUEUE.EMAIL)
    private readonly emailQueue: Queue,
  ) {}

  /**
   * Gửi email xác thực tài khoản
   */
  async sendVerification(data: {
    to: string;
    name: string;
    verifyUrl: string;
  }) {
    return this.emailQueue.add(EMAIL_JOB.SEND_VERIFICATION, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }

  /**
   * Gửi email reset mật khẩu
   */
  async sendResetPassword(data: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    return this.emailQueue.add(EMAIL_JOB.SEND_RESET_PASSWORD, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }

  /**
   * Gửi email chào mừng
   */
  async sendWelcome(data: { to: string; name: string }) {
    return this.emailQueue.add(EMAIL_JOB.SEND_WELCOME, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }
}
