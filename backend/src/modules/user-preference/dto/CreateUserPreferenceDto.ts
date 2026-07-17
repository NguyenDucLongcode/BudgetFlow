import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Currency } from 'generated/prisma/enums';

export class CreateUserPreferenceDto {
  @ApiPropertyOptional({
    example: 'vi',
    default: 'vi',
    description: 'Ngôn ngữ (vi/en)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(vi|en|ja|ko|zh)$/)
  language?: string = 'vi';

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.VND,
    default: Currency.VND,
    description: 'Đơn vị tiền tệ mặc định',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;

  @ApiPropertyOptional({
    example: 'system',
    default: 'system',
    description: 'Chủ đề giao diện (system/light/dark)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(system|light|dark)$/)
  theme?: string = 'system';

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 0,
    maximum: 6,
    description: 'Ngày bắt đầu tuần (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weekStartsOn?: number = 1;

  @ApiPropertyOptional({
    example: 'DD/MM/YYYY',
    default: 'DD/MM/YYYY',
    description: 'Định dạng ngày tháng',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(DD\/MM\/YYYY|MM\/DD\/YYYY|YYYY-MM-DD)$/)
  dateFormat?: string = 'DD/MM/YYYY';

  @ApiPropertyOptional({
    example: '24h',
    default: '24h',
    description: 'Định dạng giờ (12h/24h)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(12h|24h)$/)
  timeFormat?: string = '24h';

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Bật thông báo ngân sách',
  })
  @IsOptional()
  @IsBoolean()
  budgetNotification?: boolean = true;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Bật thông báo mục tiêu',
  })
  @IsOptional()
  @IsBoolean()
  goalNotification?: boolean = true;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Bật thông báo nợ',
  })
  @IsOptional()
  @IsBoolean()
  debtNotification?: boolean = true;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Bật thông báo giao dịch định kỳ',
  })
  @IsOptional()
  @IsBoolean()
  recurringNotification?: boolean = true;
}
