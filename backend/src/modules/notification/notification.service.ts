import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationRepository } from 'src/infrastructure/prisma/repositories';
import { CreateNotificationDto } from './dto/CreateNotificationDto';
import { NotificationQueryDto } from './dto/NotificationQueryDto';
import { NOTIFICATION } from './notification.constants';
import { NotificationType, Prisma } from 'generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    // Kiểm tra số lượng thông báo của user
    const count = await this.notificationRepository.count({
      where: {
        userId,
      },
    });

    if (count >= NOTIFICATION.MAX_NOTIFICATIONS_PER_USER) {
      throw new BadRequestException(
        `Bạn đã đạt giới hạn ${NOTIFICATION.MAX_NOTIFICATIONS_PER_USER} thông báo. Vui lòng xóa bớt.`,
      );
    }

    const notification = await this.notificationRepository.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
        // Nếu cần lưu relatedId và relatedType
        // metadata: {
        //   ...dto.metadata,
        //   relatedId: dto.relatedId,
        //   relatedType: dto.relatedType,
        // },
      },
    });

    return {
      message: 'Tạo thông báo thành công',
      data: notification,
    };
  }

  async findAll(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, type, isRead } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
    };

    const [notifications, total] = await Promise.all([
      this.notificationRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          metadata: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.notificationRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách thông báo thành công',
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      summary: {
        total,
        unread: await this.countUnread(userId),
      },
    };
  }

  async findOne(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return {
      message: 'Lấy thông tin thông báo thành công',
      data: notification,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    if (notification.isRead) {
      return {
        message: 'Thông báo đã được đọc trước đó',
        data: notification,
      };
    }

    const updated = await this.notificationRepository.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đánh dấu đã đọc thành công',
      data: updated,
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đánh dấu tất cả đã đọc thành công',
      data: {
        updatedCount: result.count,
      },
    };
  }

  async markAllAsUnread(userId: string) {
    const result = await this.notificationRepository.updateMany({
      where: {
        userId,
        isRead: true,
      },
      data: {
        isRead: false,
        readAt: null,
      },
    });

    return {
      message: 'Đánh dấu tất cả chưa đọc thành công',
      data: {
        updatedCount: result.count,
      },
    };
  }

  async remove(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    await this.notificationRepository.delete({
      where: { id: notificationId },
    });

    return {
      message: 'Xóa thông báo thành công',
    };
  }

  async removeAll(userId: string) {
    // Xóa tất cả thông báo đã đọc
    const result = await this.notificationRepository.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return {
      message: `Đã xóa ${result.count} thông báo đã đọc`,
      data: {
        deletedCount: result.count,
      },
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // =========================
  // BULK OPERATIONS
  // =========================

  async createBulk(userId: string, notifications: CreateNotificationDto[]) {
    if (notifications.length === 0) {
      throw new BadRequestException('Danh sách thông báo không được trống');
    }

    // Kiểm tra số lượng
    const count = await this.notificationRepository.count({
      where: { userId },
    });

    if (
      count + notifications.length >
      NOTIFICATION.MAX_NOTIFICATIONS_PER_USER
    ) {
      throw new BadRequestException(
        `Vượt quá giới hạn ${NOTIFICATION.MAX_NOTIFICATIONS_PER_USER} thông báo`,
      );
    }

    const result = await this.notificationRepository.createMany({
      data: notifications.map((dto) => ({
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata || {},
      })),
    });

    return {
      message: `Tạo ${result.count} thông báo thành công`,
      data: {
        createdCount: result.count,
      },
    };
  }

  // =========================
  // TRIGGER NOTIFICATIONS (Helper)
  // =========================

  async notifyBudgetAlert(
    userId: string,
    budgetId: string,
    percentage: number,
  ) {
    return this.create(userId, {
      type: NotificationType.BUDGET,
      title: `Cảnh báo ngân sách ${percentage}%`,
      message: `Bạn đã sử dụng ${percentage}% ngân sách. Vui lòng kiểm tra!`,
      metadata: {
        budgetId,
        percentage,
        alertAt: new Date().toISOString(),
      },
    });
  }

  async notifyGoalCompletion(userId: string, goalId: string, goalName: string) {
    return this.create(userId, {
      type: NotificationType.GOAL,
      title: '🎉 Chúc mừng! Mục tiêu đã đạt được!',
      message: `Bạn đã hoàn thành mục tiêu "${goalName}". Xin chúc mừng!`,
      metadata: {
        goalId,
        goalName,
        completedAt: new Date().toISOString(),
      },
    });
  }

  async notifyDebtReminder(userId: string, debtId: string, debtName: string) {
    return this.create(userId, {
      type: NotificationType.DEBT,
      title: '⏰ Nhắc nhở nợ đến hạn',
      message: `Khoản nợ "${debtName}" sắp đến hạn thanh toán. Vui lòng kiểm tra!`,
      metadata: {
        debtId,
        debtName,
        dueDate: new Date().toISOString(),
      },
    });
  }

  async notifyRecurringTransaction(
    userId: string,
    recurringId: string,
    name: string,
  ) {
    return this.create(userId, {
      type: NotificationType.RECURRING,
      title: '🔄 Giao dịch định kỳ đã thực hiện',
      message: `Giao dịch định kỳ "${name}" đã được thực hiện tự động.`,
      metadata: {
        recurringId,
        name,
        executedAt: new Date().toISOString(),
      },
    });
  }
}
