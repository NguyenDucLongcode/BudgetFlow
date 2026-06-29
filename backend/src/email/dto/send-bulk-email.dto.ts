import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBulkEmailDto {
  @ApiProperty({
    type: [String],
    example: ['user1@example.com', 'user2@example.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  to!: string[];

  @ApiProperty({ example: 'Thông báo mới từ BudgetFlow' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'newsletter' })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  context?: Record<string, any>;
}
