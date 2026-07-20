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
import { DebtType, DebtStatus, Currency } from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class CreateDebtDto {
  @ApiProperty({ example: 'Khoản vay học phí' })
  @IsString()
  @Length(1, 150)
  @Sanitize()
  name!: string;

  @ApiProperty({ enum: DebtType, example: DebtType.LOAN })
  @IsEnum(DebtType)
  type!: DebtType;

  @ApiProperty({ example: 15000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount!: number;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  interestRate?: number;

  @ApiProperty({ example: '2026-07-16T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-12-31T00:00:00Z' })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPayment?: number;

  @ApiPropertyOptional({ enum: DebtStatus, default: DebtStatus.ACTIVE })
  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus = DebtStatus.ACTIVE;

  @ApiPropertyOptional({
    example: 'Mẹ',
    description: 'Người liên hệ hoặc chủ nợ',
  })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  @Sanitize()
  contactName?: string;

  @ApiPropertyOptional({ example: 'Khoản vay để đóng học phí kỳ này' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  @Sanitize()
  description?: string;

  @ApiPropertyOptional({ example: 'Anh A' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  @Sanitize()
  borrower?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-wallet' })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ example: 'Ghi chú khoản nợ' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  @Sanitize()
  note?: string;

  @ApiPropertyOptional({ example: 'uuid-transaction' })
  @IsOptional()
  @IsUUID()
  transactionId?: string;

  @ApiPropertyOptional({ example: '2026-12-20T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  reminderSent?: boolean = false;

  @ApiPropertyOptional({ example: 'VND', default: 'VND' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;
}
