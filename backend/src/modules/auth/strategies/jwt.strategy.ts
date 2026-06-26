import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

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
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          // Lấy token từ X-Access-Token header
          const tokenHeader = req.headers['x-access-token'];
          if (!tokenHeader) return null;

          let token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;

          // Hỗ trợ cả "Bearer " prefix nếu có
          if (token.startsWith('Bearer ')) {
            token = token.substring(7);
          }

          return token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // =========================
    // TOKEN VERSION CHECK
    // =========================
    if (payload.tv !== undefined && payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
