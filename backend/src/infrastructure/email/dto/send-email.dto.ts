import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({ example: 'Chào mừng bạn đến với BudgetFlow!' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'welcome', required: false })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  context?: Record<string, any>;
}
