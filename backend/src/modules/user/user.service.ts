import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  comparePasswordHelper,
  hashPasswordHelper,
} from 'src/common/utils/user.until';
import { RedisService } from 'src/modules/redis/redis.service';
import { SessionService } from '../auth/services/auth.session.service';
import { AdminService } from './admin.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private sessionService: SessionService,
    private adminService: AdminService,
  ) {}

  // Cập nhật thông tin cá nhân
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Kiểm tra user tồn tại
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật thông tin cá nhân thành công.',
      data: updatedUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.adminService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      message: 'Get profile successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        provider: user.provider,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    // Google account
    if (!user.password) {
      throw new BadRequestException(
        'Tài khoản đăng nhập bằng Google không thể đổi mật khẩu.',
      );
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }

    // 3. So sánh mật khẩu -> nếu sai → sai đăng nhập
    const isValidPassword = await comparePasswordHelper(
      dto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ.');
    }

    const hashedPassword = await hashPasswordHelper(dto.newPassword);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    // Xóa toàn bộ session
    await this.sessionService.revokeAllUserSessions(userId);

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }
}
