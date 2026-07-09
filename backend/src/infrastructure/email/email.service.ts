import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_TEMPLATES, EMAIL_SUBJECTS } from './email.constants';
import {
  EmailOptions,
  EmailTemplateContext,
} from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Gửi email với template
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { to, subject, template, context, html, text, attachments } =
        options;

      await this.mailerService.sendMail({
        to,
        subject,
        template: template || undefined,
        context: this.buildContext(context || {}),
        html: html || undefined,
        text: text || undefined,
        attachments,
      });

      this.logger.log(
        `Email sent to ${Array.isArray(to) ? to.join(', ') : to} with subject "${subject}"`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Gửi email chào mừng
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.WELCOME,
      template: EMAIL_TEMPLATES.WELCOME,
      context: {
        name,
        company: 'BudgetFlow',
        year: new Date().getFullYear(),
        supportEmail: 'support@budgetflow.com',
      },
    });
  }

  /**
   * Gửi email đặt lại mật khẩu
   */
  async sendResetPasswordEmail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.RESET_PASSWORD,
      template: EMAIL_TEMPLATES.RESET_PASSWORD,
      context: {
        name,
        resetLink,
        year: new Date().getFullYear(),
        expiresIn: '1 giờ',
      },
    });
  }

  /**
   * Gửi email xác thực tài khoản
   */
  /**
   * Gửi email xác thực tài khoản
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    verifyUrl: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: EMAIL_SUBJECTS.VERIFICATION,
      template: EMAIL_TEMPLATES.VERIFICATION,
      context: {
        name,
        verifyUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Gửi email hàng loạt (có giới hạn rate)
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    // Chia nhỏ để tránh rate limit
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (to) => {
          await this.sendEmail({
            to,
            subject,
            template,
            context: { ...context, year: new Date().getFullYear() },
          });
          // Delay nhỏ để tránh rate limit
          await this.delay(100);
        }),
      );
    }
  }

  /**
   * Xây dựng context mặc định cho template
   */
  private buildContext(context: EmailTemplateContext): EmailTemplateContext {
    return {
      company: 'BudgetFlow',
      year: new Date().getFullYear(),
      ...context,
    };
  }

  /**
   * Helper delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
