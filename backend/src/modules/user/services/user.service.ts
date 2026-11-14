import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ChangePasswordDto } from '../dto/user/change-password.dto';
import {
  comparePasswordHelper,
  hashPasswordHelper,
} from 'src/common/utils/user.until';
import { SessionService } from '../../session/session.service';
import { UserUpdateProfileDto } from '../dto/user/user_update-profile.dto';
import { UserRepository } from 'src/infrastructure/prisma/repositories';

@Injectable()
export class UserService {
  constructor(
    private sessionService: SessionService,
    private userRepository: UserRepository,
  ) {}

  // Cập nhật thông tin cá nhân
  async updateProfile(userId: string, dto: UserUpdateProfileDto) {
    const user = await this.userRepository.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    const updatedUser = await this.userRepository.update({
      where: {
        id: userId,
      },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
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
    const user = await this.userRepository.findUnique({
      where: {
        id: userId,
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      message: 'Get profile successfully',
      data: user,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    // Tài khoản đăng nhập bằng Google/Github
    if (!user.password) {
      throw new BadRequestException(
        'Tài khoản đăng nhập bằng mạng xã hội không thể đổi mật khẩu.',
      );
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }

    const isValidPassword = await comparePasswordHelper(
      dto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới phải khác mật khẩu hiện tại.',
      );
    }

    const hashedPassword = await hashPasswordHelper(dto.newPassword);

    await this.userRepository.update({
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

    await this.sessionService.revokeAllUserSessions(userId);

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }
}
