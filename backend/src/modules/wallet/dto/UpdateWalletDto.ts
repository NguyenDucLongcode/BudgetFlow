import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Currency } from 'generated/prisma/enums';

export class UpdateWalletDto {
  @ApiPropertyOptional({
    example: 'Ví tiền mặt',
    description: 'Tên ví',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

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
    example: 0,
    description: 'Số dư ban đầu của ví',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;

  @ApiPropertyOptional({
    example: 'wallet',
    description: 'Tên icon',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  icon?: string;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Màu hiển thị',
  })
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  color?: string;

  @ApiPropertyOptional({
    example: 'Vietcombank',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  bankName?: string;

  @ApiPropertyOptional({
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  accountNumber?: string;

  @ApiPropertyOptional({
    example: 'Nguyen Van A',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  accountName?: string;

  @ApiPropertyOptional({
    example: 'Ví dùng để chi tiêu hằng ngày',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Tự động đồng bộ ví',
  })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Đánh dấu ví đã lưu trữ',
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
