import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { DebtController } from './debt.controller';
import { DebtService } from './debt.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [DebtController],
  providers: [DebtService],
  exports: [DebtService],
})
export class DebtModule {}
