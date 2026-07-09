// src/email/email.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Gửi email' })
  async sendEmail(@Body() dto: SendEmailDto) {
    await this.emailService.sendEmail({
      to: dto.to,
      subject: dto.subject,
      template: dto.template,
      context: dto.context,
    });
    return { message: 'Email sent successfully' };
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Gửi email hàng loạt' })
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    await this.emailService.sendBulkEmail(
      dto.to,
      dto.subject,
      dto.template || 'default',
      dto.context || {},
    );
    return { message: 'Bulk emails sent successfully' };
  }

  @Get('test/welcome')
  @ApiOperation({ summary: 'Test email chào mừng' })
  async testWelcome(
    @Query('email') email: string,
    @Query('name') name: string,
  ) {
    await this.emailService.sendWelcomeEmail(email, name || 'User');
    return { message: 'Welcome email sent' };
  }

  @Get('test/reset')
  @ApiOperation({ summary: 'Test email reset password' })
  async testReset(@Query('email') email: string) {
    await this.emailService.sendResetPasswordEmail(
      email,
      'User',
      'https://budgetflow.com/reset-password?token=test123',
    );
    return { message: 'Reset password email sent' };
  }
}
