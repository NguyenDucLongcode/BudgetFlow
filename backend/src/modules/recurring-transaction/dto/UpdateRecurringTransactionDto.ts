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
  IsObject,
} from 'class-validator';
import {
  Currency,
  RecurringFrequency,
  TransactionType,
} from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class UpdateRecurringTransactionDto {
  @ApiPropertyOptional({ example: 'Học phí tháng' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  @Sanitize()
  name?: string;

  @ApiPropertyOptional({ example: 'uuid-wallet' })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ example: 'uuid-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 'VND' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;

  @ApiPropertyOptional({ enum: RecurringFrequency })
  @IsOptional()
  @IsEnum(RecurringFrequency)
  frequency?: RecurringFrequency;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  interval?: number;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  nextRunDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Thanh toán tự động hằng tháng' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Sanitize()
  description?: string;

  @ApiPropertyOptional({ example: { source: 'bank' } })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
