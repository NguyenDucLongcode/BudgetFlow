import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { mailerConfig } from 'src/common/configs/mailer.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => mailerConfig(configService),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // Export để AuthService dùng
})
export class EmailModule {}
