import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
// import { ResgisterAuthDto } from './dto/resgister-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiAuthLoginSwagger } from './swagger/login.swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiAuthLoginSwagger() // Sử dụng decorator Swagger cho endpoint đăng nhập
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

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-device-id') deviceId: string,
  ) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;

    //  Kiểm tra xem refresh token có tồn tại hay không
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    // Kiểm tra xem deviceId có tồn tại hay không
    if (!deviceId) {
      throw new UnauthorizedException('Missing deviceId');
    }

    return this.authService.refreshToken(refreshToken, res, deviceId);
  }
}
