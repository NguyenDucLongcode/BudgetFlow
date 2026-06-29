import {
  PASSWORD_POLICY_MESSAGE,
  PasswordStrengthRegex,
} from 'src/common/constants/validate.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString({ message: 'Token phải là chuỗi' })
  token!: string;

  @ApiProperty({ example: 'Longxem12345@' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @Matches(PasswordStrengthRegex, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password!: string;

  @ApiProperty({ example: 'Longxem12345@' })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @IsString()
  @Match('password', {
    message: 'Mật khẩu xác nhận không khớp',
  })
  confirmPassword!: string;
}
