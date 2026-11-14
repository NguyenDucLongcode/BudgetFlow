import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nguyenduclongbede@gmail.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;

  @ApiProperty({ example: 'Longxem1234@' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là một chuỗi' })
  password!: string;

  @ApiProperty({
    example: true,
    required: true,
    description: 'Ghi nhớ đăng nhập - true: 7 ngày, false: 1 ngày',
  })
  @IsBoolean({ message: 'remember phải là kiểu boolean' })
  @IsNotEmpty({ message: 'remember không được để trống' })
  remember!: boolean;
}
