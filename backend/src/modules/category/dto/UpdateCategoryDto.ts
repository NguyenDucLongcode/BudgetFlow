import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, IsUUID } from 'class-validator';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Ăn uống',
    description: 'Tên danh mục (Tiếng Việt)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Sanitize()
  nameVi?: string;

  @ApiPropertyOptional({
    example: 'Food & Dining',
    description: 'Tên danh mục (Tiếng Anh)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Sanitize()
  nameEn?: string;

  @ApiPropertyOptional({
    example: 'Ăn uống',
    description: 'Tên danh mục (Tương thích ngược)',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Sanitize()
  name?: string;

  @ApiPropertyOptional({
    example: '🍔',
    description: 'Icon emoji hoặc tên icon',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Sanitize()
  icon?: string;

  @ApiPropertyOptional({
    example: '#FF6B6B',
    description: 'Màu sắc hiển thị',
  })
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  color?: string;

  @ApiPropertyOptional({
    example: 'uuid-category-parent',
    description: 'ID của danh mục cha (nếu có)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
