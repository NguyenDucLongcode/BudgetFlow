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
  IsObject,
  IsBoolean,
} from 'class-validator';
import {
  Currency,
  RecurringFrequency,
  TransactionType,
} from 'generated/prisma/enums';

export class CreateRecurringTransactionDto {
  @ApiProperty({ example: 'Học phí tháng' })
  @IsString()
  @Length(1, 150)
  name!: string;

  @ApiProperty({ example: 'uuid-wallet' })
  @IsUUID()
  walletId!: string;

  @ApiPropertyOptional({ example: 'uuid-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 1000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ default: 'VND' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;

  @ApiProperty({
    enum: RecurringFrequency,
    example: RecurringFrequency.MONTHLY,
  })
  @IsEnum(RecurringFrequency)
  frequency!: RecurringFrequency;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  interval?: number = 1;

  @ApiProperty({ example: '2026-07-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString()
  nextRunDate!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: 'Thanh toán tự động hằng tháng' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @ApiPropertyOptional({ example: { source: 'bank' } })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
