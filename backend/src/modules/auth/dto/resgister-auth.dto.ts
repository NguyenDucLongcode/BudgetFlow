import { Match } from 'src/common/decorators/match.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PasswordStrengthRegex,
} from 'src/common/constants/validate.constants';
import { Transform } from 'class-transformer';
import { LanguageCode } from 'generated/prisma/enums';

export class ResgisterAuthDto {
  // validName
  @ApiProperty({ example: 'Long Nguyen' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là một chuỗi' })
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

  // validUsername
  @ApiProperty({ example: 'nguyenduclong@gmail.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;

  // validPassword
  @ApiProperty({ example: 'Longxem1234@' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là một chuỗi' })
  @Matches(PasswordStrengthRegex, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password!: string;

  @ApiProperty({ example: 'Longxem1234@' })
  @IsNotEmpty({ message: 'Mật khẩu xác nhận không được để trống' })
  @IsString({ message: 'Mật khẩu xác nhận phải là một chuỗi' })
  @Match('password', { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword!: string;

  @ApiPropertyOptional({
    enum: LanguageCode,
    example: LanguageCode.EN,
    default: LanguageCode.EN,
    description: 'Ngôn ngữ của người dùng (VI/EN)',
  })
  @IsOptional()
  @Transform(({ value }: { value: any }) => {
    if (typeof value === 'string') {
      const upper = value.trim().toUpperCase();
      return upper === 'VI' ? LanguageCode.VI : LanguageCode.EN;
    }
    return value;
  })
  @IsEnum(LanguageCode)
  language?: LanguageCode;
}
