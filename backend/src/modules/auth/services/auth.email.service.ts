import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResgisterAuthDto } from '../dto/resgister-auth.dto';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/modules/user/users.service';
import { hashPasswordHelper } from 'src/common/utils/user.until';
import * as crypto from 'crypto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthEmailService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: ResgisterAuthDto) {
    const { email, password, name } = registerDto;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await hashPasswordHelper(password);

    // Tạo verify token và thời gian hết hạn
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Tạo user mới trong cơ sở dữ liệu
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isActive: false,
        verifyToken,
        verifyTokenExpiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Gửi email xác thực tài khoản
    const verifyUrl =
      `${this.configService.get('FRONTEND_URL')}` +
      `/verify-email?token=${verifyToken}`;

    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verifyUrl,
    );

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      data: user,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Token xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    // Nếu đã kích hoạt rồi
    if (user.isActive) {
      return {
        message: 'Tài khoản đã được kích hoạt trước đó',
      };
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
        verifyToken: null,
        verifyTokenExpiresAt: null,
        verifiedAt: new Date(),
      },
    });

    return {
      message: 'Xác thực email thành công. Bạn có thể đăng nhập.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000, // 1h
    );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    const resetLink =
      `${this.configService.get('FRONTEND_URL')}` +
      `/reset-password?token=${resetToken}`;

    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.name,
      resetLink,
    );

    return {
      message:
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    const hashedPassword = await hashPasswordHelper(password);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,

        resetPasswordToken: null,
        resetPasswordExpiresAt: null,

        // Logout tất cả thiết bị
        tokenVersion: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return {
        message: 'Nếu tài khoản tồn tại, email xác thực đã được gửi.',
      };
    }

    // Đã xác thực rồi
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được xác thực');
    }

    // Sinh token mới
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiresAt,
      },
    });

    const verifyUrl =
      `${this.configService.get('FRONTEND_URL')}` +
      `/verify-email?token=${verifyToken}`;

    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verifyUrl,
    );

    return {
      message: 'Email xác thực đã được gửi lại.',
    };
  }
}
