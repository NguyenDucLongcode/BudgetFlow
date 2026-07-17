import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateContributionDto {
  @ApiPropertyOptional({
    example: 1200000,
    description: 'Số tiền đóng góp',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({
    example: 'Đóng góp từ lương tháng 1 (đã điều chỉnh)',
    description: 'Ghi chú',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00Z',
    description: 'Ngày đóng góp',
  })
  @IsOptional()
  @IsDateString()
  contributionDate?: string;
}
