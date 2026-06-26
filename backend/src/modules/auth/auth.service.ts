import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from 'src/common/utils/user.until';
import { LoginParams } from 'src/common/interfaces/login-params.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { parseExpiryToMs } from 'src/common/utils/time.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    // 1. Không tìm thấy user → sai đăng nhập
    if (!user) {
      throw new UnauthorizedException(`Email hoặc mật khẩu không đúng`);
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
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException(`Mật khẩu không đúng`);
    }

    // Chưa xác thực email
    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản chưa được xác thực email');
    }

    const { password: _password, ...result } = user;

    return result;
  }

  async login(params: LoginParams) {
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

    // Thu hồi tất cả refresh token cũ của user trên thiết bị này
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        deviceId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Tạo access token và refresh token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    // Tạo refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Hash refresh token để lưu vào cơ sở dữ liệu
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // EXPIRES_AT (QUAN TRỌNG)
    const refreshExpiresInMs = parseExpiryToMs(
      this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    );

    // Lưu refresh token vào cơ sở dữ liệu đã qua hashing
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        deviceId,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
        expiresAt: new Date(Date.now() + refreshExpiresInMs),
        revokedAt: null,
      },
    });

    // Lưu refresh token vào cookie khoảng 7 ngày, httpOnly, secure, sameSite
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiresInMs,
    });

    return {
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
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
