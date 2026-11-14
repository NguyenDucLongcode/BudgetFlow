import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BudgetRepository,
  NotificationRepository,
  RecurringTransactionRepository,
} from 'src/infrastructure/prisma/repositories';
import { NotificationType, Prisma } from 'generated/prisma/client';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly budgetRepository: BudgetRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scan(): Promise<void> {
    try {
      await Promise.all([
        this.notifyUpcomingRecurringTransactions(),
        this.notifyBudgetAlerts(),
      ]);
    } catch (error) {
      this.logger.error('Notification scan failed', error);
    }
  }

  private async notifyUpcomingRecurringTransactions(): Promise<void> {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const recurringTransactions = await this.recurringRepository.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        nextRunDate: { gte: now, lte: nextDay },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        nextRunDate: true,
      },
    });

    const data: Prisma.NotificationCreateManyInput[] = [];
    for (const transaction of recurringTransactions) {
      const alreadyNotified = await this.notificationRepository.findFirst({
        where: {
          userId: transaction.userId,
          type: NotificationType.RECURRING,
          createdAt: { gte: this.startOfDay(now) },
          metadata: {
            path: ['recurringId'],
            equals: transaction.id,
          },
        },
        select: { id: true },
      });

      if (!alreadyNotified) {
        data.push({
          userId: transaction.userId,
          type: NotificationType.RECURRING,
          title: 'Giao dịch định kỳ sắp đến hạn',
          message: `Giao dịch "${transaction.name}" sẽ được thực hiện trong 24 giờ tới.`,
          metadata: {
            recurringId: transaction.id,
            nextRunDate: transaction.nextRunDate.toISOString(),
          },
        });
      }
    }

    if (data.length > 0) {
      await this.notificationRepository.createMany({ data });
    }
  }

  private async notifyBudgetAlerts(): Promise<void> {
    const now = new Date();
    const budgets = await this.budgetRepository.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        isAlertEnabled: true,
        alertThreshold: { not: null },
      },
      select: {
        id: true,
        userId: true,
        spent: true,
        amount: true,
        alertThreshold: true,
      },
    });

    const data: Prisma.NotificationCreateManyInput[] = [];
    for (const budget of budgets) {
      if (
        budget.alertThreshold === null ||
        Number(budget.spent) <= Number(budget.alertThreshold)
      ) {
        continue;
      }

      const alreadyNotified = await this.notificationRepository.findFirst({
        where: {
          userId: budget.userId,
          type: NotificationType.BUDGET,
          createdAt: { gte: this.startOfDay(now) },
          metadata: {
            path: ['budgetId'],
            equals: budget.id,
          },
        },
        select: { id: true },
      });

      if (!alreadyNotified) {
        data.push({
          userId: budget.userId,
          type: NotificationType.BUDGET,
          title: 'Cảnh báo ngân sách',
          message: `Chi tiêu đã vượt ngưỡng cảnh báo của ngân sách (${Number(budget.spent).toLocaleString('vi-VN')} / ${Number(budget.amount).toLocaleString('vi-VN')}).`,
          metadata: {
            budgetId: budget.id,
            spent: Number(budget.spent),
            alertThreshold: Number(budget.alertThreshold),
          },
        });
      }
    }

    if (data.length > 0) {
      await this.notificationRepository.createMany({ data });
    }
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}
