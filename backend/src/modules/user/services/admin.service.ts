import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AdminUpdateUserDto } from '../dto/admin/admin_update-profile.dto';
import {
  DebtStatus,
  GoalStatus,
  Prisma,
  Role,
  TransactionType,
  UserStatus,
} from 'generated/prisma/client';
import { SessionService } from '../../session/session.service';
import { AdminPaginationUsersDto } from '../dto/admin/admin_pagination_query';
import {
  AuditLogRepository,
  BudgetRepository,
  CategoryRepository,
  DebtRepository,
  GoalRepository,
  NotificationRepository,
  SessionRepository,
  TransactionRepository,
  UserRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';

@Injectable()
export class AdminService {
  constructor(
    private sessionService: SessionService,
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private walletRepository: WalletRepository,
    private categoryRepository: CategoryRepository,
    private transactionRepository: TransactionRepository,
    private budgetRepository: BudgetRepository,
    private goalRepository: GoalRepository,
    private debtRepository: DebtRepository,
    private notificationRepository: NotificationRepository,
    private auditLogRepository: AuditLogRepository,
  ) {}

  // Lấy tất cả users
  async findAll(query: AdminPaginationUsersDto) {
    const { page, limit, search, role, status } = query;

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

    if (status) {
      where.status = status;
    }

    const statsWhere: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    const [users, total, statusStats, admins] = await Promise.all([
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
          avatar: true,
          name: true,
          role: true,
          status: true,
          provider: true,
          createdAt: true,
        },
      }),

      this.userRepository.count({
        where,
      }),

      this.userRepository.groupBy({
        by: ['status'],
        where: statsWhere,
        _count: {
          status: true,
        },
      }),

      this.userRepository.count({
        where: {
          ...statsWhere,
          role: Role.ADMIN,
        },
      }),
    ]);

    const counts = {
      total: await this.userRepository.count({
        where: statsWhere,
      }),
      active: 0,
      pending: 0,
      suspended: 0,
      admins,
    };

    for (const item of statusStats) {
      switch (item.status) {
        case UserStatus.ACTIVE:
          counts.active = item._count.status;
          break;

        case UserStatus.PENDING:
          counts.pending = item._count.status;
          break;

        case UserStatus.SUSPENDED:
          counts.suspended = item._count.status;
          break;
      }
    }

    return {
      message: 'Lấy danh sách người dùng thành công.',
      data: {
        users,
        counts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
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
        status: true,
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
        status: true,
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
      // ===== Users =====
      totalUsers,
      activeUsers,
      adminUsers,

      // ===== Sessions =====
      onlineUsers,
      totalDevices,

      // ===== Wallets =====
      totalWallets,

      // ===== Categories =====
      totalCategories,
      systemCategories,
      customCategories,

      // ===== Transactions =====
      totalTransactions,
      incomeTransactions,
      expenseTransactions,
      transferTransactions,

      // ===== Budgets =====
      totalBudgets,
      activeBudgets,

      // ===== Goals =====
      totalGoals,
      completedGoals,

      // ===== Debts =====
      totalDebts,
      activeDebts,

      // ===== Notifications =====
      totalNotifications,
      unreadNotifications,

      // ===== Audit Logs =====
      totalAuditLogs,
    ] = await Promise.all([
      // Users
      this.userRepository.count({
        where: { deletedAt: null },
      }),

      this.userRepository.count({
        where: {
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
      }),

      this.userRepository.count({
        where: {
          role: Role.ADMIN,
          deletedAt: null,
        },
      }),

      // Sessions
      this.sessionRepository.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      }),

      this.sessionRepository.count(),

      // Wallets
      this.walletRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      // Categories
      this.categoryRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.categoryRepository.count({
        where: {
          isSystem: true,
          deletedAt: null,
        },
      }),

      this.categoryRepository.count({
        where: {
          isSystem: false,
          deletedAt: null,
        },
      }),

      // Transactions
      this.transactionRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.transactionRepository.count({
        where: {
          type: TransactionType.INCOME,
          deletedAt: null,
        },
      }),

      this.transactionRepository.count({
        where: {
          type: TransactionType.EXPENSE,
          deletedAt: null,
        },
      }),

      this.transactionRepository.count({
        where: {
          type: TransactionType.TRANSFER,
          deletedAt: null,
        },
      }),

      // Budgets
      this.budgetRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.budgetRepository.count({
        where: {
          isActive: true,
          deletedAt: null,
        },
      }),

      // Goals
      this.goalRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.goalRepository.count({
        where: {
          status: GoalStatus.COMPLETED,
          deletedAt: null,
        },
      }),

      // Debts
      this.debtRepository.count({
        where: {
          deletedAt: null,
        },
      }),

      this.debtRepository.count({
        where: {
          status: DebtStatus.ACTIVE,
          deletedAt: null,
        },
      }),

      // Notifications
      this.notificationRepository.count(),

      this.notificationRepository.count({
        where: {
          isRead: false,
        },
      }),

      // Audit Logs
      this.auditLogRepository.count(),
    ]);

    return {
      message: 'Dashboard loaded successfully.',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
        },

        sessions: {
          online: onlineUsers,
          devices: totalDevices,
        },

        wallets: {
          total: totalWallets,
        },

        categories: {
          total: totalCategories,
          system: systemCategories,
          custom: customCategories,
        },

        transactions: {
          total: totalTransactions,
          income: incomeTransactions,
          expense: expenseTransactions,
          transfer: transferTransactions,
        },

        budgets: {
          total: totalBudgets,
          active: activeBudgets,
        },

        goals: {
          total: totalGoals,
          completed: completedGoals,
        },

        debts: {
          total: totalDebts,
          active: activeDebts,
        },

        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
        },

        auditLogs: {
          total: totalAuditLogs,
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
        status: 'PENDING',
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
  async toggleActive(id: string, targetStatus?: UserStatus) {
    if (targetStatus && targetStatus === UserStatus.PENDING) {
      throw new BadRequestException(
        'Admin không được phép đặt trạng thái tài khoản thành PENDING',
      );
    }

    if (
      targetStatus &&
      targetStatus !== UserStatus.ACTIVE &&
      targetStatus !== UserStatus.SUSPENDED
    ) {
      throw new BadRequestException(
        'Trạng thái chỉ có thể là ACTIVE hoặc SUSPENDED',
      );
    }

    const user = await this.userRepository.findUniqueOrThrow({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.status === UserStatus.PENDING && !targetStatus) {
      throw new BadRequestException(
        'Tài khoản đang ở trạng thái PENDING (chưa xác thực email), không thể đổi trạng thái',
      );
    }

    // Xóa toàn bộ session và refresh token của user
    await this.sessionService.revokeAllUserSessions(user.id);

    const nextStatus = targetStatus
      ? targetStatus
      : user.status === UserStatus.ACTIVE
        ? UserStatus.SUSPENDED
        : UserStatus.ACTIVE;

    const updatedUser = await this.userRepository.update({
      where: { id },
      data: {
        status: nextStatus,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: `User has been ${updatedUser.status === UserStatus.ACTIVE ? 'activated' : 'suspended'} successfully.`,
      data: {
        id: updatedUser.id,
        status: updatedUser.status,
      },
    };
  }
}
