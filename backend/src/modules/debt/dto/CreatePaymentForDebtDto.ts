import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class CreatePaymentForDebtDto {
  @ApiProperty({ example: 1000000, description: 'Số tiền thanh toán' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 'uuid-wallet', description: 'ID của ví nguồn / đích' })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod = PaymentMethod.CASH;

  @ApiPropertyOptional({ example: 'Trả tiền mặt đợt 1' })
  @IsOptional()
  @IsString()
  @Sanitize()
  note?: string;

  @ApiPropertyOptional({ example: '2026-07-16T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
