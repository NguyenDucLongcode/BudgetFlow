import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'], // Yêu cầu quyền truy cập vào email và thông tin hồ sơ của người dùng
      passReqToCallback: true, // Cho phép truy cập vào req trong hàm validate
    });
  }

  validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    return {
      email: profile.emails?.[0].value,
      name: profile.displayName,
      picture: profile.photos?.[0].value,
      provider: 'google',
      providerId: profile.id, // ✅ Thêm
      deviceId: req.query.state,
    };
  }
}
