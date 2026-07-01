import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { SessionService } from './services/auth.session.service';
import { AuthEmailService } from './services/auth.email.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthOAuth20Service } from './services/auth.oauth20.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EmailModule,

    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SessionService,
    AuthEmailService,
    GoogleStrategy,
    AuthOAuth20Service,
  ],
  exports: [AuthService],
})
export class AuthModule {}
