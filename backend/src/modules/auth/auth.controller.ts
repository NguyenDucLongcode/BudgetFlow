import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ResgisterAuthDto } from './dto/resgister-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Đăng nhập

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-device-id') deviceId: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Kiểm tra deviceId
    if (!deviceId) {
      throw new BadRequestException('Thiếu device id');
    }

    // Validate user
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    return this.authService.login({
      user,
      res,
      deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? 'Unknown',
    });
  }
}
