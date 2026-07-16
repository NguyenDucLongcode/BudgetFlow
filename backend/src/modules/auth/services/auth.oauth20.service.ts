import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from 'src/common/interfaces/google-user.interface';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import * as crypto from 'crypto';
import { getRefreshKey } from 'src/common/utils/redis.key.hepler';
import { parseExpiryToMs } from 'src/common/utils/time.util';
import { Request, Response } from 'express';
import {
  SessionRepository,
  UserRepository,
} from 'src/infrastructure/prisma/repositories';

@Injectable()
export class AuthOAuth20Service {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private jwtService: JwtService,
    private redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async googleLogin(
    googleUser: GoogleUser,
    deviceId: string,
    req: Request,
    res: Response,
  ) {
    // 1. Tìm user theo provider + providerId
    let user = await this.userRepository.findFirst({
      where: {
        provider: googleUser.provider,
        providerId: googleUser.providerId,
      },
    });

    // 2. Nếu chưa có, tìm theo email
    if (!user) {
      user = await this.userRepository.findUnique({
        where: { email: googleUser.email },
      });
    }

    // 3. Nếu tìm thấy user bằng email nhưng chưa có provider
    if (user && !user.provider) {
      user = await this.userRepository.update({
        where: { id: user.id },
        data: {
          provider: googleUser.provider,
          providerId: googleUser.providerId,
          isActive: true,
          name: user.name || googleUser.name, // Giữ tên cũ nếu có
          avatar: user.avatar || googleUser.picture,
        },
      });
    }

    // 4. Nếu chưa có user nào → tạo mới
    if (!user) {
      user = await this.userRepository.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          isActive: true,
          provider: googleUser.provider,
          providerId: googleUser.providerId,
        },
      });
    }

    // 3. Tạo payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };

    // 4. Sinh token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // 5. Lưu refresh token vào Redis
    const redis = this.redisService.getClient();

    const hashed = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const redisKey = getRefreshKey(user.id, deviceId);

    const expires =
      parseExpiryToMs(
        this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      ) / 1000;

    await redis.set(
      redisKey,
      JSON.stringify({
        tokenHash: hashed,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }),
      'EX',
      expires,
    );

    // 6. Tạo hoặc update session
    await this.sessionRepository.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId,
        },
      },
      update: {
        lastActiveAt: new Date(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
      create: {
        userId: user.id,
        deviceId,
        userAgent: req.headers['user-agent'] ?? 'Unknown',
        ipAddress: req.ip,
        lastActiveAt: new Date(),
      },
    });

    // 7. Set cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expires * 1000,
    });

    return {
      message: 'Google login success',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  }
}
