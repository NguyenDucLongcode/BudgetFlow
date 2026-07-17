import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  IsObject,
} from 'class-validator';
import { NotificationType } from 'generated/prisma/enums';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.BUDGET,
    description: 'Loại thông báo',
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    example: 'Cảnh báo ngân sách',
    description: 'Tiêu đề thông báo',
  })
  @IsString()
  @Length(1, 255)
  title!: string;

  @ApiProperty({
    example: 'Bạn đã sử dụng 80% ngân sách tháng này',
    description: 'Nội dung thông báo',
  })
  @IsString()
  @Length(1, 1000)
  message!: string;

  @ApiPropertyOptional({
    example: {
      budgetId: '123e4567-e89b-12d3-a456-426614174000',
      percentage: 80,
    },
    description: 'Metadata bổ sung (JSON)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID của entity liên quan (budgetId, goalId, debtId, etc.)',
  })
  @IsOptional()
  @IsUUID()
  relatedId?: string;

  @ApiPropertyOptional({
    example: 'budget',
    description: 'Tên entity liên quan',
  })
  @IsOptional()
  @IsString()
  relatedType?: string;
}
