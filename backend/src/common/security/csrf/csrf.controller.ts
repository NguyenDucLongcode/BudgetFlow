import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../decorators/public.decorator';
import { CsrfService } from './csrf.service';
import { SkipCsrf } from './decorator/skip-csrf.decorator';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrf: CsrfService) {}

  @Public()
  @SkipCsrf()
  @Get('token')
  getToken(@Res({ passthrough: true }) res: Response) {
    const token = this.csrf.generateToken();

    // Set cookie
    res.cookie(this.csrf.getCookieName(), token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.csrf.getCookieMaxAge(),
      path: '/',
    });

    return {
      csrfToken: token,
      expiresIn: '24h',
      message: 'CSRF token generated successfully',
    };
  }

  @Public()
  @SkipCsrf()
  @Get('refresh')
  refreshToken(@Res({ passthrough: true }) res: Response) {
    const token = this.csrf.generateToken();

    res.cookie(this.csrf.getCookieName(), token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.csrf.getCookieMaxAge(),
      path: '/',
    });

    return {
      csrfToken: token,
      expiresIn: '24h',
      message: 'CSRF token refreshed successfully',
    };
  }
}
