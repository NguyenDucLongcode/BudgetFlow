import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ContributionQueryDto {
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
    example: '2024-01-01',
    description: 'Từ ngày (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Đến ngày (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
