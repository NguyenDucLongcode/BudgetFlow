// config/mailer.config.ts
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const mailerConfig = (configService: ConfigService): MailerOptions => {
  const host = configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
  const port = configService.get<number>('SMTP_PORT', 587);
  const user = configService.get<string>('SMTP_USER');
  const pass = configService.get<string>('SMTP_PASS');

  // Kiểm tra thông tin bắt buộc
  if (!user || !pass) {
    throw new Error(
      'SMTP_USER and SMTP_PASS must be defined in environment variables',
    );
  }

  // Cấu hình transport với các tùy chọn tối ưu cho Gmail
  const transportOptions = {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production', // ✅ Sửa: xóa dấu nháy đơn thừa
    },
    pool: true,
    maxConnections: 5,
    rateLimit: true,
    maxMessages: 100,
    socketTimeout: 30000,
    connectionTimeout: 30000,
  };

  // XÁC ĐỊNH ĐƯỜNG DẪN TEMPLATES CHÍNH XÁC
  const templatesDir = join(__dirname, '..', '..', 'email', 'templates');

  return {
    transport: transportOptions,
    defaults: {
      from: `"${configService.get<string>('SMTP_FROM_NAME', 'BudgetFlow')}" <${configService.get<string>('SMTP_FROM_EMAIL', 'noreply@budgetflow.com')}>`,
    },
    template: {
      dir: templatesDir,
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    preview: process.env.NODE_ENV !== 'production',
  };
};
