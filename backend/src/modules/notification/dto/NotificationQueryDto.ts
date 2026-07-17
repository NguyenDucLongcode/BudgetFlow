import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from 'generated/prisma/enums';

export class NotificationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Trang hiện tại',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Số lượng mỗi trang',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: NotificationType,
    example: NotificationType.BUDGET,
    description: 'Lọc theo loại thông báo',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    example: false,
    description: 'Lọc theo trạng thái đã đọc',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRead?: boolean;
}
