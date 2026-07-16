import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  Matches,
} from 'class-validator';
import { Currency, WalletType } from 'generated/prisma/enums';

export class CreateWalletDto {
  @ApiProperty({
    example: 'Ví tiền mặt',
    description: 'Tên ví',
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    enum: WalletType,
    example: WalletType.CASH,
    description: 'Loại ví',
  })
  @IsEnum(WalletType)
  type!: WalletType;

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
    default: 0,
    description: 'Số dư ban đầu của ví',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number = 0;

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
    example: 'Ví tiền mặt để chi tiêu hàng ngày',
    description: 'Mô tả ví',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean = true;
}
