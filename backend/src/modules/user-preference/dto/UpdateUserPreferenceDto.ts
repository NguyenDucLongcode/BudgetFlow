import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { Currency } from 'generated/prisma/enums';

export class UpdateUserPreferenceDto {
  @ApiPropertyOptional({
    example: 'en',
    description: 'Ngôn ngữ (vi/en)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(vi|en|ja|ko|zh)$/)
  language?: string;

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.USD,
    description: 'Đơn vị tiền tệ mặc định',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    example: 'dark',
    description: 'Chủ đề giao diện (system/light/dark)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(system|light|dark)$/)
  theme?: string;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    maximum: 6,
    description: 'Ngày bắt đầu tuần (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weekStartsOn?: number;

  @ApiPropertyOptional({
    example: 'MM/DD/YYYY',
    description: 'Định dạng ngày tháng',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(DD\/MM\/YYYY|MM\/DD\/YYYY|YYYY-MM-DD)$/)
  dateFormat?: string;

  @ApiPropertyOptional({
    example: '12h',
    description: 'Định dạng giờ (12h/24h)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(12h|24h)$/)
  timeFormat?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Bật thông báo ngân sách',
  })
  @IsOptional()
  @IsBoolean()
  budgetNotification?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Bật thông báo mục tiêu',
  })
  @IsOptional()
  @IsBoolean()
  goalNotification?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Bật thông báo nợ',
  })
  @IsOptional()
  @IsBoolean()
  debtNotification?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Bật thông báo giao dịch định kỳ',
  })
  @IsOptional()
  @IsBoolean()
  recurringNotification?: boolean;
}
