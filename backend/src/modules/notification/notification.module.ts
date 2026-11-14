import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AuditLogModule } from '../audit/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationScheduler } from './notification.scheduler';
import { AdminNotificationController } from './admin-notification.controller';

@Module({
  imports: [PrismaModule, AuditLogModule, ScheduleModule.forRoot()],
  controllers: [NotificationController, AdminNotificationController],
  providers: [NotificationService, NotificationScheduler],
  exports: [NotificationService],
})
export class NotificationModule {}
