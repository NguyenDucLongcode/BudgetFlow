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
import { Currency, GoalPriority, GoalStatus } from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Mua xe máy' })
  @IsString()
  @Length(1, 150)
  name!: string;

  @ApiProperty({ example: 30000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  targetAmount!: number;

  @ApiProperty({ example: '2026-07-16T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-12-31T00:00:00Z' })
  @IsDateString()
  targetDate!: string;

  @ApiPropertyOptional({ enum: GoalStatus, default: GoalStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus = GoalStatus.IN_PROGRESS;

  @ApiPropertyOptional({ enum: GoalPriority, default: GoalPriority.MEDIUM })
  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority = GoalPriority.MEDIUM;

  @ApiPropertyOptional({ example: 'Tiết kiệm để mua xe' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Sanitize()
  description?: string;

  @ApiPropertyOptional({ example: 'Không rút trước hạn' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  @Sanitize()
  notes?: string;

  @ApiPropertyOptional({ example: 'target' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Sanitize()
  icon?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-wallet' })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ example: '2026-12-25T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  reminderSent?: boolean = false;

  @ApiPropertyOptional({ example: 'VND', default: 'VND' })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.VND;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean = false;
}
