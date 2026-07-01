import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'generated/prisma/client';
import { RedisService } from 'src/modules/redis/redis.service';
import { SessionService } from '../auth/services/auth.session.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private sessionService: SessionService,
  ) {}

  // Lấy tất cả users
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy user theo ID
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // include: {
      //   refreshTokens: true,
      // },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Tìm user theo email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Cập nhật user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Kiểm tra user tồn tại
    await this.findOne(id);

    // Nếu update email, kiểm tra trùng
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Đếm số lượng users
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  // Tìm user theo id
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async deleteAccount(userId: string) {
    // Xóa toàn bộ session và refresh token của user
    // 1. Xóa session trong cơ sở dữ liệu và Redis
    // 2. Xóa refresh token trong cơ sở dữ liệu và Redis
    await this.sessionService.revokeAllUserSessions(userId);

    // 4. soft delete user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      message: 'Account deleted successfully',
    };
  }

  // Active/Deactive user
  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Xóa toàn bộ session và refresh token của user
    // 1. Xóa session trong cơ sở dữ liệu và Redis
    // 2. Xóa refresh token trong cơ sở dữ liệu và Redis
    await this.sessionService.revokeAllUserSessions(user.id);

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }
}
