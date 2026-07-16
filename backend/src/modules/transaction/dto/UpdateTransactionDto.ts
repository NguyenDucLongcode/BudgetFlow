import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    enum: TransactionType,
    description: 'Loại giao dịch',
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Số tiền giao dịch (luôn dương)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.VND,
    description: 'Đơn vị tiền tệ',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    example: 'Mua đồ ăn trưa',
    description: 'Mô tả giao dịch',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @ApiPropertyOptional({
    example: 'Ăn tại nhà hàng ABC',
    description: 'Ghi chú thêm',
  })
  @IsOptional()
  @IsString()
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
    description: 'Trạng thái giao dịch',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    example: 'uuid-category',
    description: 'ID của danh mục',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: 'uuid-wallet',
    description: 'ID của ví',
  })
  @IsOptional()
  @IsUUID()
  walletId?: string | null;

  @ApiPropertyOptional({
    example: 'uuid-from-wallet',
    description: 'ID ví nguồn',
  })
  @IsOptional()
  @IsUUID()
  fromWalletId?: string | null;

  @ApiPropertyOptional({
    example: 'uuid-to-wallet',
    description: 'ID ví đích',
  })
  @IsOptional()
  @IsUUID()
  toWalletId?: string | null;

  @ApiPropertyOptional({
    example: { location: 'Hà Nội' },
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
