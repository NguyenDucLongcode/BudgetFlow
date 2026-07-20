import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class UpdateAttachmentDto {
  @ApiPropertyOptional({
    example: 'hoa-don-dien-moi.jpg',
    description: 'Tên file mới',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Sanitize()
  fileName?: string;
}
