import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from 'src/common/utils/user.until';
import { LoginParams } from 'src/common/interfaces/login-params.interface';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { parseExpiryToMs } from 'src/common/utils/time.util';
import { Response } from 'express';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { getRefreshKey } from 'src/common/utils/redis.key.hepler';
import { JwtPayload } from './strategies/type';
import { SessionService } from 'src/modules/session/session.service';
import {
  SessionRepository,
  UserRepository,
} from 'src/infrastructure/prisma/repositories';
import { CsrfService } from 'src/core/security/csrf';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private sessionService: SessionService,
    private sessionRepository: SessionRepository,
    private csrfService: CsrfService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findUnique({
      where: { email },
    });

    // 1. Không tìm thấy user → sai đăng nhập
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // 2 User đăng ký bằng Google/Github
    if (user.provider && !user.password) {
      throw new UnauthorizedException(
        `Tài khoản này đăng nhập bằng ${user.provider}`,
      );
    }

    // 3. So sánh mật khẩu -> nếu sai → sai đăng nhập
    const isValidPassword = await comparePasswordHelper(
      password,
      user.password ? user.password : '',
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Chưa xác thực email
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'The account has not been verified or has been disabled.',
      );
    }

    if (user.deletedAt) {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa ');
    }

    const { password: _password, ...result } = user;

    return result;
  }

  async login(params: LoginParams) {
    const { user, res, deviceId, ipAddress, userAgent, remember } = params;

    if (!deviceId) {
      throw new UnauthorizedException('Missing deviceId');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };

    // Access token 15m
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Refresh token: nếu remember = true thì 7d, còn false thì 1d (hoặc 1h)
    const refreshExpiresIn = remember
      ? this.configService.get('JWT_REFRESH_EXPIRES_IN') // 7d
      : '1d'; // hoặc '1h' nếu muốn ngắn hơn

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    });

    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const refreshExpiresInSeconds =
      parseExpiryToMs(refreshExpiresIn as string) / 1000;

    const redisKey = getRefreshKey(user.id, deviceId);

    await this.redisService.set(
      redisKey,
      JSON.stringify({
        tokenHash: hashedToken,
        userId: user.id,
        deviceId,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        remember: remember ?? false,
      }),
      refreshExpiresInSeconds,
    );

    await this.sessionRepository.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId,
        },
      },
      create: {
        userId: user.id,
        deviceId,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        isRemember: remember ?? false,
      },
      update: {
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        isRemember: remember ?? false,
      },
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiresInSeconds * 1000,
    });

    this.csrfService.setCsrfCookie(res);

    return {
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        deviceId,
        remember: remember ?? false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  }
  async refreshToken(refreshToken: string, res: Response, deviceId: string) {
    // Verify JWT Refresh Token
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Tìm key trong Redis
    const redisKey = getRefreshKey(payload.sub, deviceId);

    const tokenData = await this.redisService.get(redisKey);

    if (!tokenData) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // So sánh hash của refresh token từ Redis với hash của refresh token được gửi lên
    const parsedToken = JSON.parse(tokenData);

    const hashed = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    if (parsedToken.tokenHash !== hashed) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Kiểm tra user
    const user = await this.userRepository.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'The account has not been verified or has been disabled.',
      );
    }

    if (payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    // Lấy rememberMe từ Redis
    const rememberMe = parsedToken.rememberMe ?? false;

    // Xác định thời gian hết hạn dựa trên rememberMe (giữ nguyên như lúc login)
    const refreshExpiresIn = rememberMe
      ? this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d' // 7 ngày
      : '1d'; // hoặc '1h' - phải giống với lúc login

    const newPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };

    // Tạo access token mới
    const accessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Tạo refresh token mới với thời gian giữ nguyên
    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn, // Dùng thời gian từ rememberMe
    });

    const hashedNew = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    const refreshExpiresInSeconds =
      parseExpiryToMs(refreshExpiresIn as string) / 1000;

    // Lưu refresh token mới vào redis
    await this.redisService.set(
      redisKey,
      JSON.stringify({
        tokenHash: hashedNew,
        userId: user.id,
        deviceId: deviceId,
        userAgent: parsedToken.userAgent ?? null,
        ipAddress: parsedToken.ipAddress ?? null,
        rememberMe: rememberMe, // Giữ lại rememberMe
      }),
      refreshExpiresInSeconds,
    );

    // Update session
    await this.sessionRepository.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId,
        },
      },
      create: {
        userId: user.id,
        deviceId,
        userAgent: parsedToken.userAgent ?? null,
        ipAddress: parsedToken.ipAddress ?? null,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        isRemember: rememberMe, // Giữ lại rememberMe
      },
      update: {
        lastActiveAt: new Date(),
      },
    });

    // Set cookie với max-age tương ứng
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiresInSeconds * 1000, // 👈 Cập nhật
    });

    this.csrfService.setCsrfCookie(res);

    return {
      message: 'Refresh token success',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        refreshExpiresIn: refreshExpiresIn, // Trả về FE biết
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  }

  async logout(userId: string, deviceId: string, res: Response) {
    const session = await this.sessionRepository.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Phiên đăng nhập không tồn tại.');
    }

    // Xóa refresh token trong Redis
    const redisKey = getRefreshKey(userId, deviceId);

    await this.redisService.del(redisKey);

    // Xóa session trong DB
    await this.sessionRepository.delete({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });

    // Xóa cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Xóa CSRF cookie
    this.csrfService.clearCsrfCookie(res);

    return {
      message: 'Logout successful',
    };
  }

  async logoutAll(userId: string, res: Response) {
    // Xóa toàn bộ session trong DB
    await this.sessionService.revokeAllUserSessions(userId);

    // Xóa cookie trên thiết bị hiện tại
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Xóa CSRF cookie
    this.csrfService.clearCsrfCookie(res);

    return {
      message: 'Logout all devices successfully',
    };
  }
}
