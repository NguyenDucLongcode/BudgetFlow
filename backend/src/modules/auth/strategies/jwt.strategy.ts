import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { JwtPayload } from './type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Lấy JWT_ACCESS_SECRET từ file .env
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in .env file');
    }

    // Gọi hàm khởi tạo của PassportStrategy (cha)
    super({
      // CHỈ lấy token từ Authorization header với format Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        deletedAt: true,
        tokenVersion: true,
      },
    });

    // Kiểm tra user tồn tại và đang hoạt động
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Unauthorized');
    }

    // =========================
    // TOKEN VERSION CHECK
    // =========================
    if (payload.tv !== undefined && payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
