import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PasswordStrengthRegex,
} from 'src/common/constants/validate.constants';
import { Match } from 'src/common/decorators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Longxem12345@' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword!: string;

  @ApiProperty({ example: 'Longxem12345@' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @Matches(PasswordStrengthRegex, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword!: string;

  @ApiProperty({ example: 'Longxem12345@' })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @IsString()
  @Match('newPassword', {
    message: 'Mật khẩu xác nhận không khớp',
  })
  confirmPassword!: string;
}
