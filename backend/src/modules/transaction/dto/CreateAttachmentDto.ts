import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';
import { AttachmentType } from 'generated/prisma/enums';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class CreateAttachmentDto {
  @ApiProperty({
    example: 'hoa-don-dien.jpg',
    description: 'Tên file',
  })
  @IsString()
  @Length(1, 255)
  fileName!: string;

  @ApiProperty({
    example: 'https://storage.example.com/hoa-don-dien.jpg',
    description: 'URL của file',
  })
  @IsUrl()
  @Sanitize()
  fileUrl!: string;

  @ApiPropertyOptional({
    example: 'image/jpeg',
    description: 'MIME type của file',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    example: 1024,
    description: 'Kích thước file (bytes)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024) // 10MB
  fileSize?: number;

  @ApiPropertyOptional({
    enum: AttachmentType,
    example: AttachmentType.IMAGE,
    default: AttachmentType.IMAGE,
    description: 'Loại file đính kèm',
  })
  @IsOptional()
  @IsEnum(AttachmentType)
  type?: AttachmentType = AttachmentType.IMAGE;
}
