import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Role, UserStatus } from 'generated/prisma/client';
import { Sanitize } from 'src/common/decorators/sanitize.decorator';

export class AdminPaginationUsersDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ example: 10 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Sanitize()
  search?: string;

  @ApiPropertyOptional({
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
