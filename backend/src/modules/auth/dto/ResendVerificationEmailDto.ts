import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailDto {
  // validUsername
  @ApiProperty({ example: 'nguyenduclongbede@gmai.com' }) // Hiện thuộc tính trên Swagger Ui
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;
}
