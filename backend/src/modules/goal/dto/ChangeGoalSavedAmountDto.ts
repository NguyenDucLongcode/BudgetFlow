import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ChangeGoalSavedAmountDto {
  @ApiProperty({
    example: 500000,
    description: 'Số tiền cần cộng hoặc trừ khỏi mục tiêu',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
