import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { NotificationType } from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export enum NotificationTargetRole {
  USER = 'USER',
  ALL = 'ALL',
}

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'Bảo trì hệ thống' })
  @IsString()
  @Length(1, 255)
  @Sanitize()
  title!: string;

  @ApiProperty({ example: 'Hệ thống sẽ bảo trì vào 23:00 hôm nay.' })
  @IsString()
  @Length(1, 1000)
  @Sanitize()
  message!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SYSTEM })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ enum: NotificationTargetRole, example: NotificationTargetRole.USER })
  @IsEnum(NotificationTargetRole)
  targetRole!: NotificationTargetRole;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  specificUserId?: string;
}
