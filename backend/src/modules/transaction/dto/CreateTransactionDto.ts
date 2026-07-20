// src/modules/transaction/dto/CreateTransactionDto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsUUID,
  IsNumber,
  Min,
  IsDateString,
  IsObject,
} from 'class-validator';
import {
  Currency,
  TransactionType,
  TransactionStatus,
} from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Loại giao dịch',
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    example: 100000,
    description: 'Số tiền giao dịch (luôn dương)',
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.VND,
    default: Currency.VND,
    description: 'Đơn vị tiền tệ',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;

  @ApiPropertyOptional({
    example: 'Mua đồ ăn trưa',
    description: 'Mô tả giao dịch',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Sanitize()
  description?: string;

  @ApiPropertyOptional({
    example: 'Ăn tại nhà hàng ABC',
    description: 'Ghi chú thêm',
  })
  @IsOptional()
  @IsString()
  @Sanitize()
  note?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00Z',
    description: 'Ngày giao dịch',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
    description: 'Trạng thái giao dịch',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus = TransactionStatus.COMPLETED;

  @ApiPropertyOptional({
    example: 'uuid-category',
    description: 'ID của danh mục (cho INCOME và EXPENSE)',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'uuid-wallet',
    description: 'ID của ví (cho INCOME và EXPENSE)',
  })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({
    example: 'uuid-from-wallet',
    description: 'ID ví nguồn (cho TRANSFER)',
  })
  @IsOptional()
  @IsUUID()
  fromWalletId?: string;

  @ApiPropertyOptional({
    example: 'uuid-to-wallet',
    description: 'ID ví đích (cho TRANSFER)',
  })
  @IsOptional()
  @IsUUID()
  toWalletId?: string;

  @ApiPropertyOptional({
    example: { location: 'Hà Nội', tags: ['food', 'lunch'] },
    description: 'Metadata bổ sung',
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({
    example: 'REF-2024-001',
    description: 'Mã tham chiếu',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
