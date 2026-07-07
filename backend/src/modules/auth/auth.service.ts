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
import { RedisService } from 'src/modules/redis/redis.service';
import { getRefreshKey } from 'src/common/utils/redis.key.hepler';
import { JwtPayload } from './strategies/type';
import { SessionService } from 'src/modules/session/session.service';
import { SessionRepository, UserRepository } from 'src/prisma/repositories';
import { CsrfService } from 'src/common/security/csrf';

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
    const user = await this.userRepository.findByEmail(email);

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
    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản chưa được xác thực email');
    }

    if (user.deletedAt) {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa ');
    }

    const { password: _password, ...result } = user;

    return result;
  }

  async login(params: LoginParams) {
    const redis = this.redisService.getClient();

    const { user, res, deviceId, ipAddress, userAgent } = params;

    if (!deviceId) {
      throw new UnauthorizedException('Missing deviceId');
    }

    // Lưu thông tin đăng nhập vào cơ sở dữ liệu (nếu cần)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };

    // Tạo access token và refresh token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Tạo refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const refreshExpiresInSeconds =
      parseExpiryToMs(
        this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      ) / 1000;

    // Key Redis
    const redisKey = getRefreshKey(user.id, deviceId);

    // Lưu refresh token vào Redis với thời gian hết hạn
    await redis.set(
      redisKey,
      JSON.stringify({
        tokenHash: hashedToken,
        userId: user.id,
        deviceId,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
      }),
      'EX',
      refreshExpiresInSeconds,
    );

    // Lưu thông tin đăng nhập vào cơ sở dữ liệu (UserSession)
    // Nếu user đã đăng nhập trên thiết bị này trước đó, cập nhật thông tin
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
      },

      update: {
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Lưu refresh token vào cookie khoảng 7 ngày, httpOnly, secure, sameSite
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiresInSeconds * 1000,
    });

    // set CSRF cookie
    this.csrfService.setCsrfCookie(res);

    return {
      message: 'Đăng nhập thành công',
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

  async refreshToken(refreshToken: string, res: Response, deviceId: string) {
    const redis = this.redisService.getClient();

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

    const tokenData = await redis.get(redisKey);

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

    // Kiểm tra user trong cơ sở dữ liệu
    // Nếu user không tồn tại hoặc không active → trả về lỗi
    // Nếu token version không khớp → trả về lỗi
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    if (payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException('Refresh token revoked');
    }

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

    // Tạo refresh token mới (quan trọng)
    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Hash refresh token mới để lưu vào cơ sở dữ liệu
    const hashedNew = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    const refreshExpiresInSeconds =
      parseExpiryToMs(
        this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      ) / 1000;

    // Lưu refresh token mới vào redis, ghi đè refresh token cũ
    await redis.set(
      redisKey,
      JSON.stringify({
        tokenHash: hashedNew,
        userAgent: parsedToken.userAgent ?? null,
        ipAddress: parsedToken.ipAddress ?? null,
      }),
      'EX',
      refreshExpiresInSeconds,
    );

    // Cập nhật thông tin đăng nhập trong cơ sở dữ liệu (UserSession)
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
      },

      update: {
        lastActiveAt: new Date(),
      },
    });

    // set cookie lại
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiresInSeconds * 1000,
    });

    // set CSRF cookie
    this.csrfService.setCsrfCookie(res);

    return {
      message: 'Refresh token success',
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

    const redis = this.redisService.getClient();

    // Xóa refresh token trong Redis
    const redisKey = getRefreshKey(userId, deviceId);

    await redis.del(redisKey);

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
