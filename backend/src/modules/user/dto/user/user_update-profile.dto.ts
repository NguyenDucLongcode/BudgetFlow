import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class UserUpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Đức Long',
    description: 'Họ và tên',
  })
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @Length(2, 100, {
    message: 'Họ và tên phải từ 2 đến 100 ký tự',
  })
  @Transform(({ value }: { value: string }) => value.trim())
  @Sanitize()
  name?: string;
}
