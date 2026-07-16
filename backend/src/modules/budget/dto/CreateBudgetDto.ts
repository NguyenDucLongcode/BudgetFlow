import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { BudgetPeriod, BudgetType } from 'generated/prisma/enums';

export class CreateBudgetDto {
  @ApiProperty({
    example: 'uuid-category',
    description: 'Danh mục áp dụng cho ngân sách',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    example: 5000000,
    description: 'Số tiền ngân sách',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    example: '2026-07-01T00:00:00Z',
    description: 'Ngày bắt đầu',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-07-31T23:59:59Z',
    description: 'Ngày kết thúc',
  })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    enum: BudgetPeriod,
    default: BudgetPeriod.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BudgetPeriod)
  period?: BudgetPeriod = BudgetPeriod.MONTHLY;

  @ApiPropertyOptional({
    enum: BudgetType,
    default: BudgetType.SPENDING,
    description: 'Loại ngân sách',
  })
  @IsOptional()
  @IsEnum(BudgetType)
  type?: BudgetType = BudgetType.SPENDING;

  @ApiPropertyOptional({
    example: 4500000,
    description: 'Ngưỡng cảnh báo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  alertThreshold?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'Bật cảnh báo khi chạm ngưỡng',
  })
  @IsOptional()
  @IsBoolean()
  isAlertEnabled?: boolean = false;

  @ApiPropertyOptional({
    example: 'Ngân sách ăn uống tháng 7',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @ApiPropertyOptional({
    example: 'Ưu tiên giảm chi cuối tuần',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  notes?: string;
}
