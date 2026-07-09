import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AdminUpdateUserDto } from '../dto/admin/admin_update-profile.dto';
import { Prisma, Role } from 'generated/prisma/client';
import { SessionService } from '../../session/session.service';
import { AdminPaginationUsersDto } from '../dto/admin/admin_pagination_query';
import {
  SessionRepository,
  UserRepository,
} from 'src/infrastructure/prisma/repositories';

@Injectable()
export class AdminService {
  constructor(
    private sessionService: SessionService,
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
  ) {}

  // Lấy tất cả users
  async findAll(query: AdminPaginationUsersDto) {
    const { page, limit, search, role, isActive } = query;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.userRepository.count({
        where,
      }),
    ]);

    return {
      message: 'Lấy danh sách người dùng thành công.',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Lấy user theo ID
  async findOne(id: string) {
    const user = await this.userRepository.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        provider: true,
        timezone: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,

        sessions: {
          select: {
            id: true,
            deviceId: true,
            userAgent: true,
            ipAddress: true,
            lastLoginAt: true,
            lastActiveAt: true,
            createdAt: true,
          },
          orderBy: {
            lastActiveAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Lấy thông tin người dùng thành công.',
      data: user,
    };
  }

  // Cập nhật user
  async update(id: string, dto: AdminUpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const exists = await this.userRepository.findFirst({
        where: {
          email: dto.email,
          id: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      if (exists) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.userRepository.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        timezone: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Trang dashboard admin
  async dashboard() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      onlineUsers,
      totalDevices,
    ] = await Promise.all([
      this.userRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.userRepository.count({
        where: {
          isActive: true,
          deletedAt: null,
        },
      }),

      this.userRepository.count({
        where: {
          isActive: false,
          deletedAt: null,
        },
      }),

      this.userRepository.count({
        where: {
          role: Role.ADMIN,
          deletedAt: null,
        },
      }),

      this.sessionRepository.count({
        where: {
          // Ví dụ: hoạt động trong 5 phút gần nhất
          lastActiveAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      }),

      this.sessionRepository.count(),
    ]);

    return {
      message: 'Lấy thông tin dashboard thành công.',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          admins: adminUsers,
        },
        sessions: {
          online: onlineUsers,
          devices: totalDevices,
        },
      },
    };
  }

  async remove(userId: string, adminId: string) {
    const user = await this.userRepository.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (adminId === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    if (user.deletedAt) {
      throw new BadRequestException('User has already been deleted.');
    }

    // Xóa toàn bộ session và refresh token của user
    // 1. Xóa session trong cơ sở dữ liệu và Redis
    // 2. Xóa refresh token trong cơ sở dữ liệu và Redis
    await this.sessionService.revokeAllUserSessions(userId);

    // 4. soft delete user
    await this.userRepository.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Account deleted successfully',
    };
  }

  // Active/Deactive user
  async toggleActive(id: string) {
    const user = await this.userRepository.findUniqueOrThrow({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Xóa toàn bộ session và refresh token của user
    // 1. Xóa session trong cơ sở dữ liệu và Redis
    // 2. Xóa refresh token trong cơ sở dữ liệu và Redis
    await this.sessionService.revokeAllUserSessions(user.id);

    const updatedUser = await this.userRepository.update({
      where: { id },
      data: {
        isActive: !user.isActive,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: `User has been ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        id: updatedUser.id,
        isActive: updatedUser.isActive,
      },
    };
  }
}
