import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({
    example: 'Important',
    description: 'Tên tag',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Màu sắc (hex code)',
  })
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  color?: string;

  @ApiPropertyOptional({
    example: '⭐',
    description: 'Icon emoji hoặc tên icon',
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  icon?: string;
}
