import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateDebtPaymentDto {
  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: '2026-07-16T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Trả trước một phần' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  note?: string;

  @ApiPropertyOptional({ example: 'uuid-transaction' })
  @IsOptional()
  @IsUUID()
  transactionId?: string | null;
}
