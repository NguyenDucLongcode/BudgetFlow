import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ResgisterAuthDto } from '../dto/resgister-auth.dto';
import { hashPasswordHelper } from 'src/common/utils/user.until';
import * as crypto from 'crypto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { ConfigService } from '@nestjs/config';
import {
  UserRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { EmailQueueService } from 'src/infrastructure/queue/email/email-queue.service';
import { LanguageCode, WalletType } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class AuthEmailService {
  constructor(
    private userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService, // Inject EmailQueueService
    private readonly walletRepository: WalletRepository,
  ) {}

  async register(registerDto: ResgisterAuthDto) {
    const { email, password, name } = registerDto;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await hashPasswordHelper(password);

    // Tạo verify token và thời gian hết hạn
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Tạo user mới trong cơ sở dữ liệu
    const user = await this.userRepository.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: 'PENDING',
        verifyToken,
        verifyTokenExpiresAt,
        preferences: {
          create: {
            language: registerDto.language || LanguageCode.EN,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        provider: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        preferences: {
          select: {
            language: true,
          },
        },
      },
    });

    await this.walletRepository.create({
      data: {
        userId: user.id,
        name: 'Ví tiền mặt',
        type: WalletType.CASH,
        currency: 'VND',
        balance: new Prisma.Decimal(0),
        initialBalance: new Prisma.Decimal(0),
        icon: 'wallet',
        color: '#3B82F6',
        isDefault: true,
      },
    });

    // Gửi email xác thực tài khoản
    const verifyUrl =
      `${this.configService.get('FRONTEND_URL')}` +
      `/verify-email?token=${verifyToken}`;

    await this.emailQueueService.sendVerification({
      to: user.email,
      name: user.name,
      verifyUrl,
    });

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      data: {
        ...user,
        language:
          user.preferences?.language || registerDto.language || LanguageCode.EN,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findFirst({
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
    if (user.status === 'ACTIVE') {
      return {
        message: 'Tài khoản đã được kích hoạt trước đó',
      };
    }

    await this.userRepository.update({
      where: {
        id: user.id,
      },
      data: {
        status: 'ACTIVE',
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
    const user = await this.userRepository.findUnique({
      where: { email },
    });

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

    await this.userRepository.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: expiresAt,
      },
    });

    const resetLink =
      `${this.configService.get('FRONTEND_URL')}` +
      `/reset-password?token=${resetToken}`;

    await this.emailQueueService.sendResetPassword({
      to: user.email,
      name: user.name,
      resetUrl: resetLink,
    });

    return {
      message:
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;

    const user = await this.userRepository.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
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

    await this.userRepository.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,

        resetToken: null,
        resetTokenExpiresAt: null,

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
    const user = await this.userRepository.findUnique({
      where: { email },
    });

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return {
        message: 'Nếu tài khoản tồn tại, email xác thực đã được gửi.',
      };
    }

    // Đã xác thực rồi
    if (user.status === 'ACTIVE') {
      throw new BadRequestException('Tài khoản đã được xác thực');
    }

    // Sinh token mới
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepository.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiresAt,
      },
    });

    const verifyUrl =
      `${this.configService.get('FRONTEND_URL')}` +
      `/verify-email?token=${verifyToken}`;

    await this.emailQueueService.sendVerification({
      to: user.email,
      name: user.name,
      verifyUrl,
    });

    return {
      message: 'Email xác thực đã được gửi lại.',
    };
  }
}
