import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/infrastructure/prisma/repositories';
import { AuditAction } from 'generated/prisma/enums';

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Ghi log hành động
   */
  async log(data: AuditLogData): Promise<void> {
    await this.auditLogRepository.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Lấy lịch sử hoạt động của user
   */
  async getUserLogs(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      action?: AuditAction;
      entity?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(filters?.action && { action: filters.action }),
      ...(filters?.entity && { entity: filters.entity }),
      ...(filters?.fromDate && {
        createdAt: { gte: filters.fromDate },
      }),
      ...(filters?.toDate && {
        createdAt: { lte: filters.toDate },
      }),
    };

    const [logs, total] = await Promise.all([
      this.auditLogRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.auditLogRepository.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy tất cả logs (Admin only)
   */
  async getAllLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: AuditAction;
      entity?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.entity && { entity: filters.entity }),
      ...(filters?.fromDate && {
        createdAt: { gte: filters.fromDate },
      }),
      ...(filters?.toDate && {
        createdAt: { lte: filters.toDate },
      }),
    };

    const [logs, total] = await Promise.all([
      this.auditLogRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.auditLogRepository.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Thống kê logs theo action
   */
  async getActionStats(userId?: string, fromDate?: Date, toDate?: Date) {
    const where: any = {
      ...(userId && { userId }),
      ...(fromDate && { createdAt: { gte: fromDate } }),
      ...(toDate && { createdAt: { lte: toDate } }),
    };

    const logs = await this.auditLogRepository.findMany({
      where,
      select: {
        action: true,
      },
    });

    const stats = logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: logs.length,
      stats,
    };
  }

  /**
   * Xóa logs cũ (ví dụ: xóa logs > 30 ngày)
   */
  async cleanOldLogs(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.auditLogRepository.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
