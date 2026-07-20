import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class TagQueryDto {
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
    example: 'urgent',
    description: 'Tìm kiếm theo tên',
  })
  @IsOptional()
  @IsString()
  @Sanitize()
  search?: string;

  @ApiPropertyOptional({
    example: 'name',
    enum: ['name', 'createdAt'],
    description: 'Sắp xếp theo trường',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp',
  })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'asc';
}
