import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma/enums';

export class CreateDebtPaymentDto {
  @ApiProperty({ example: 'uuid-debt' })
  @IsUUID()
  debtId!: string;

  @ApiProperty({ example: 1000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-07-16T00:00:00Z' })
  @IsDateString()
  paymentDate!: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod = PaymentMethod.CASH;

  @ApiPropertyOptional({ example: 'Trả trước một phần' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  note?: string;

  @ApiPropertyOptional({ example: 'uuid-transaction' })
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}
