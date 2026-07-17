import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({
    example: 1000000,
    description: 'Số tiền đóng góp',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID của ví nguồn (nếu có)',
  })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({
    example: 'Đóng góp từ lương tháng 1',
    description: 'Ghi chú',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00Z',
    description: 'Ngày đóng góp (mặc định: now)',
  })
  @IsOptional()
  @IsDateString()
  contributionDate?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID của transaction liên kết (nếu có)',
  })
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}
