import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { DebtPaymentController } from './debt-payment.controller';
import { DebtPaymentService } from './debt-payment.service';

@Module({
  imports: [PrismaModule],
  controllers: [DebtPaymentController],
  providers: [DebtPaymentService],
  exports: [DebtPaymentService],
})
export class DebtPaymentModule {}
