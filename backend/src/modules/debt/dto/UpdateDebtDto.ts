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
import { DebtType, DebtStatus, Currency } from 'generated/prisma/enums';

export class UpdateDebtDto {
  @ApiPropertyOptional({ example: 'Khoản vay học phí' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  name?: string;

  @ApiPropertyOptional({ enum: DebtType })
  @IsOptional()
  @IsEnum(DebtType)
  type?: DebtType;

  @ApiPropertyOptional({ example: 15000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalAmount?: number;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  interestRate?: number | null;

  @ApiPropertyOptional({ example: '2026-07-16T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPayment?: number | null;

  @ApiPropertyOptional({ enum: DebtStatus })
  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;

  @ApiPropertyOptional({ example: 'Mẹ' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  contactName?: string;

  @ApiPropertyOptional({ example: 'Khoản vay để đóng học phí kỳ này' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({ example: 'Anh A' })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  borrower?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-wallet' })
  @IsOptional()
  @IsUUID()
  walletId?: string | null;

  @ApiPropertyOptional({ example: 'Ghi chú khoản nợ' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  note?: string;

  @ApiPropertyOptional({ example: 'uuid-transaction' })
  @IsOptional()
  @IsUUID()
  transactionId?: string | null;

  @ApiPropertyOptional({ example: '2026-12-20T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  reminderDate?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  reminderSent?: boolean;

  @ApiPropertyOptional({ example: 'VND' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;
}
