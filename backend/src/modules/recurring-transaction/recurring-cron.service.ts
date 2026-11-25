import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  NotificationType,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import { RecurringTransactionRepository } from 'src/infrastructure/prisma/repositories';
import { NotificationGateway } from 'src/modules/notification/notification.gateway';
import { RecurringTransactionService } from './recurring-transaction.service';

@Injectable()
export class RecurringCronService {
  private readonly logger = new Logger(RecurringCronService.name);

  constructor(
    private readonly recurringTransactionRepository: RecurringTransactionRepository,
    private readonly recurringTransactionService: RecurringTransactionService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueRecurringTransactions(): Promise<void> {
    // Luôn sử dụng thời điểm UTC hiện tại để so sánh chính xác với cột Timestamptz
    const nowUtc = new Date(new Date().toISOString());

    try {
      const dueRecurrings = await this.recurringTransactionRepository.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          nextRunDate: {
            lte: nowUtc,
          },
        },
        include: {
          wallet: true,
          category: true,
        },
      });

      if (dueRecurrings.length === 0) {
        return;
      }

      this.logger.log(
        `Phát hiện ${dueRecurrings.length} giao dịch định kỳ đến hạn. Bắt đầu xử lý...`,
      );

      for (const recurring of dueRecurrings) {
        try {
          const executedAt = new Date(recurring.nextRunDate);
          const nextRunDate = this.recurringTransactionService.addInterval(
            executedAt,
            recurring.frequency,
            recurring.interval,
          );
          const shouldStayActive = recurring.endDate
            ? nextRunDate.getTime() <= new Date(recurring.endDate).getTime()
            : true;

          const createdTx =
            await this.recurringTransactionRepository.prisma.$transaction(
              async (prismaTx) => {
                // 1. Tạo bản ghi Transaction mới
                const tx = await prismaTx.transaction.create({
                  data: {
                    userId: recurring.userId,
                    walletId: recurring.walletId,
                    categoryId: recurring.categoryId,
                    type: recurring.type,
                    amount: recurring.amount,
                    currency: recurring.currency,
                    date: executedAt,
                    description: `Giao dịch định kỳ: ${recurring.name}`,
                    note: recurring.description ?? null,
                    status: TransactionStatus.COMPLETED,
                  },
                });

                // 2. Cập nhật số dư Ví tương ứng
                if (recurring.type === TransactionType.INCOME) {
                  await prismaTx.wallet.update({
                    where: { id: recurring.walletId },
                    data: {
                      balance: { increment: recurring.amount },
                    },
                  });
                } else if (recurring.type === TransactionType.EXPENSE) {
                  await prismaTx.wallet.update({
                    where: { id: recurring.walletId },
                    data: {
                      balance: { decrement: recurring.amount },
                    },
                  });
                }

                // 3. Cập nhật lastRunDate, nextRunDate và trạng thái isActive
                await prismaTx.recurringTransaction.update({
                  where: { id: recurring.id },
                  data: {
                    lastRunDate: executedAt,
                    nextRunDate,
                    isActive: shouldStayActive,
                  },
                });

                // 4. Tạo thông báo (Notification) cho user
                await prismaTx.notification.create({
                  data: {
                    userId: recurring.userId,
                    type: NotificationType.SYSTEM,
                    title: 'Giao dịch định kỳ tự động',
                    message: `Đã tự động tạo giao dịch định kỳ: ${recurring.name}`,
                    metadata: {
                      recurringTransactionId: recurring.id,
                      transactionId: tx.id,
                      amount: Number(recurring.amount),
                      type: recurring.type,
                      walletId: recurring.walletId,
                    },
                  },
                });

                return tx;
              },
            );

          // 5. Bắn sự kiện realtime qua WebSocket tới người dùng
          this.notificationGateway.sendTransactionCompleted(recurring.userId, {
            transactionId: createdTx.id,
            amount: Number(createdTx.amount),
            type: createdTx.type,
            currency: createdTx.currency,
            description: createdTx.description,
            walletId: createdTx.walletId,
            date: createdTx.date,
          });
        } catch (itemError) {
          this.logger.error(
            `Lỗi khi xử lý giao dịch định kỳ ${recurring.id}: ${itemError instanceof Error ? itemError.message : String(itemError)}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Lỗi quét giao dịch định kỳ: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
