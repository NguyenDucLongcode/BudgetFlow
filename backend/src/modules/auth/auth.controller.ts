import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ResgisterAuthDto } from './dto/resgister-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import {} from './swagger/auth_Swagger/login.swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ApiAuthRefreshTokenSwagger,
  ApiAuthLoginSwagger,
  ApiAuthLogoutSwagger,
  ApiAuthLogoutAllSwagger,
  ApiVerifyEmailSwagger,
  ApiResendVerificationSwagger,
  ApiForgotPasswordSwagger,
  ApiResetPasswordSwagger,
  ApiGoogleAuthSwagger,
  ApiGoogleCallbackSwagger,
} from './swagger';
import { ForgotPasswordDto } from './dto/fogotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { AuthEmailService } from './services/auth.email.service';
import { SessionService } from '../session/session.service';
import { ResendVerificationEmailDto } from './dto/ResendVerificationEmailDto';
import { GoogleAuthGuard } from './strategies/guards/google-auth.guard';
import { SocialUser } from 'src/common/interfaces/social-user.interface';
import { ConfigService } from '@nestjs/config';
import { AuthOAuth20Service } from './services/auth.oauth20.service';
import { SkipCsrf } from 'src/core/security/csrf';
import { UserRepository } from 'src/infrastructure/prisma/repositories';
import { RateLimit } from 'src/core/security/rate-limit/decorator/rate-limit.decorator';
import { RATE_LIMIT } from 'src/core/security/rate-limit/constants/rate-limit.constants';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { AuthProvider } from 'generated/prisma/enums';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly authEmailService: AuthEmailService,
    private readonly authOAuth20Service: AuthOAuth20Service,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  @Public()
  @SkipCsrf()
  // @RateLimit(RATE_LIMIT.AUTH.LOGIN)
  @Post('login')
  @ApiAuthLoginSwagger() // Sử dụng decorator Swagger cho endpoint đăng nhập
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-device-id') deviceId: string,
    @Req() req: Request,
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
      remember: loginDto.remember,
    });
  }

  @Public()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.REFRESH)
  @Post('refresh-token')
  @ApiAuthRefreshTokenSwagger()
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

  @Post('register')
  @SkipCsrf()
  @Public()
  // @RateLimit(RATE_LIMIT.AUTH.REGISTER)
  register(@Body() registerDto: ResgisterAuthDto) {
    return this.authEmailService.register(registerDto);
  }

  @Public()
  @ApiAuthSwaggerUI()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.LOGOUT)
  @Post('logout')
  @ApiAuthLogoutSwagger()
  logout(
    @Headers('x-device-id') deviceId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!deviceId) {
      throw new BadRequestException('Thiếu device id');
    }

    return this.authService.logout(deviceId, res);
  }

  @ApiAuthSwaggerUI()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.LOGOUT_ALL)
  @Post('logout-all')
  @ApiAuthLogoutAllSwagger()
  logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logoutAll(userId, res);
  }

  @Public()
  @SkipCsrf()
  @Get('verify-email')
  @ApiVerifyEmailSwagger()
  verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Thiếu token xác thực');
    }

    return this.authEmailService.verifyEmail(token);
  }

  @Public()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.RESEND_VERIFICATION)
  @Post('resend-verification-email')
  @ApiResendVerificationSwagger()
  resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    return this.authEmailService.resendVerificationEmail(dto.email);
  }

  @Public()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.FORGOT_PASSWORD)
  @Post('forgot-password')
  @ApiForgotPasswordSwagger()
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authEmailService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @SkipCsrf()
  @RateLimit(RATE_LIMIT.AUTH.RESET_PASSWORD)
  @Post('reset-password')
  @ApiResetPasswordSwagger()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authEmailService.resetPassword(dto);
  }

  @Public()
  @SkipCsrf()
  @Get('google')
  @ApiGoogleAuthSwagger()
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Public()
  @SkipCsrf()
  @Get('google/callback')
  @ApiGoogleCallbackSwagger()
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const deviceId = (req.query.state as string) || 'unknown-device';

    const user = await this.userRepository.findUnique({
      where: { email: req.user?.email as string },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Tạo GoogleUser từ dữ liệu đã được Strategy trả về
    const googleUser: SocialUser = {
      email: user.email,
      name: user.name,
      picture: user.avatar || undefined, // FIX: was req.user.avatar
      provider: AuthProvider.GOOGLE,
      providerId: user.providerId || '', // FIX: remove || '' fallback
    };

    const result = await this.authOAuth20Service.googleLogin(
      googleUser,
      deviceId,
      req,
      res,
    );

    // Redirect về frontend với token
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return res.redirect(
      `${frontendUrl}/auth/social-success?token=${result.data.accessToken}`,
    );
  }
}
