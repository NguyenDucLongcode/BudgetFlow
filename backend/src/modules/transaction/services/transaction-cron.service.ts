import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  TransactionRepository,
} from 'src/infrastructure/prisma/repositories';
import {
  BudgetType,
  NotificationType,
  Prisma,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import { NotificationGateway } from 'src/modules/notification/notification.gateway';

@Injectable()
export class TransactionCronService {
  private readonly logger = new Logger(TransactionCronService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingTransactions(): Promise<void> {
    const now = new Date();

    try {
      // Tìm tất cả các giao dịch dự kiến (PENDING) mà ngày giao dịch <= thời điểm hiện tại
      const pendingTransactions = await this.transactionRepository.findMany({
        where: {
          status: TransactionStatus.PENDING,
          deletedAt: null,
          date: {
            lte: now,
          },
        },
        include: {
          wallet: true,
          fromWallet: true,
          toWallet: true,
          category: true,
        },
      });

      if (pendingTransactions.length === 0) {
        return;
      }

      this.logger.log(
        `Phát hiện ${pendingTransactions.length} giao dịch dự kiến đã đến hạn. Bắt đầu xử lý...`,
      );

      for (const txItem of pendingTransactions) {
        try {
          await this.transactionRepository.prisma.$transaction(
            async (prismaTx) => {
              // 1. Cập nhật trạng thái thành COMPLETED
              await prismaTx.transaction.update({
                where: { id: txItem.id },
                data: {
                  status: TransactionStatus.COMPLETED,
                },
              });

              // 2. Cập nhật số dư ví tương ứng
              await this.applyBalance(prismaTx, txItem);

              // 3. Cập nhật tiến độ ngân sách nếu là chi tiêu
              if (
                txItem.type === TransactionType.EXPENSE &&
                txItem.categoryId
              ) {
                await this.adjustBudgetSpent(
                  prismaTx,
                  txItem.userId,
                  {
                    categoryId: txItem.categoryId,
                    date: txItem.date,
                    amount: txItem.amount,
                  },
                  'increment',
                );
              }

              // 4. Tạo thông báo (Notification) cho người dùng
              const amountFormatted = Number(txItem.amount).toLocaleString(
                'vi-VN',
              );
              const typeLabel =
                txItem.type === TransactionType.INCOME
                  ? 'Thu nhập'
                  : txItem.type === TransactionType.EXPENSE
                  ? 'Chi tiêu'
                  : 'Chuyển tiền';

              await prismaTx.notification.create({
                data: {
                  userId: txItem.userId,
                  type: NotificationType.SYSTEM,
                  title: 'Giao dịch dự kiến đã được thực hiện',
                  message: `Khoản ${typeLabel} "${
                    txItem.description || txItem.category?.name || 'Giao dịch'
                  }" trị giá ${amountFormatted} ${
                    txItem.currency
                  } đã đến hạn và được thực hiện tự động. Số dư ví đã được cập nhật.`,
                  metadata: {
                    transactionId: txItem.id,
                    amount: Number(txItem.amount),
                    type: txItem.type,
                    walletId: txItem.walletId,
                  },
                },
              });
            },
          );

          // 5. Bắn sự kiện realtime qua WebSocket tới người dùng
          this.notificationGateway.sendTransactionCompleted(txItem.userId, {
            transactionId: txItem.id,
            amount: Number(txItem.amount),
            type: txItem.type,
            currency: txItem.currency,
            description: txItem.description,
            walletId: txItem.walletId,
            date: txItem.date,
          });

          this.logger.log(
            `Đã xử lý xong giao dịch dự kiến ${txItem.id} của user ${txItem.userId}`,
          );
        } catch (itemError) {
          this.logger.error(
            `Lỗi khi xử lý giao dịch dự kiến ${txItem.id}:`,
            itemError,
          );
        }
      }
    } catch (error) {
      this.logger.error('Lỗi khi quét giao dịch dự kiến:', error);
    }
  }

  private async applyBalance(
    tx: Prisma.TransactionClient,
    transaction: any,
  ): Promise<void> {
    switch (transaction.type) {
      case TransactionType.INCOME:
        if (transaction.walletId) {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });
        }
        break;

      case TransactionType.EXPENSE:
        if (transaction.walletId) {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: {
                decrement: transaction.amount,
              },
            },
          });
        }
        break;

      case TransactionType.TRANSFER:
        if (transaction.fromWalletId) {
          await tx.wallet.update({
            where: { id: transaction.fromWalletId },
            data: {
              balance: {
                decrement: transaction.amount,
              },
            },
          });
        }
        if (transaction.toWalletId) {
          await tx.wallet.update({
            where: { id: transaction.toWalletId },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });
        }
        break;
    }
  }

  private async adjustBudgetSpent(
    tx: Prisma.TransactionClient,
    userId: string,
    transaction: {
      categoryId: string | null;
      date: Date;
      amount: Prisma.Decimal | number;
    },
    mode: 'increment' | 'decrement',
  ): Promise<void> {
    if (!transaction.categoryId) {
      return;
    }

    const budget = await tx.budget.findFirst({
      where: {
        userId,
        categoryId: transaction.categoryId,
        deletedAt: null,
        isActive: true,
        type: BudgetType.SPENDING,
        startDate: {
          lte: transaction.date,
        },
        endDate: {
          gte: transaction.date,
        },
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return;
    }

    const currentSpent = Number(budget.spent);
    const txAmount = Number(transaction.amount);
    const newSpent =
      mode === 'increment'
        ? currentSpent + txAmount
        : Math.max(0, currentSpent - txAmount);

    const updatedBudget = await tx.budget.update({
      where: {
        id: budget.id,
      },
      data: {
        spent: newSpent,
      },
      include: {
        category: true,
      },
    });

    if (mode === 'increment' && updatedBudget.isAlertEnabled) {
      const budgetAmount = Number(updatedBudget.amount);
      const rawThreshold = updatedBudget.alertThreshold
        ? Number(updatedBudget.alertThreshold)
        : 80;

      const thresholdAmount =
        rawThreshold <= 100
          ? (budgetAmount * rawThreshold) / 100
          : rawThreshold;

      if (newSpent >= thresholdAmount || newSpent >= budgetAmount) {
        const isExceeded = newSpent >= budgetAmount;
        const percent = Math.round((newSpent / budgetAmount) * 100);
        const categoryName = updatedBudget.category?.name || 'Chi tiêu';
        const title = isExceeded
          ? 'Cảnh báo vượt quá ngân sách!'
          : `Cảnh báo chi tiêu đạt ${percent}% ngân sách`;
        const message = isExceeded
          ? `Bạn đã chi ${newSpent.toLocaleString('vi-VN')} VND cho danh mục "${categoryName}", vượt quá hạn mức ngân sách ${budgetAmount.toLocaleString('vi-VN')} VND.`
          : `Bạn đã chi ${newSpent.toLocaleString('vi-VN')} VND cho danh mục "${categoryName}", đạt ${percent}% hạn mức ngân sách ${budgetAmount.toLocaleString('vi-VN')} VND.`;

        const notification = await tx.notification.create({
          data: {
            userId,
            type: NotificationType.BUDGET,
            title,
            message,
            metadata: {
              budgetId: updatedBudget.id,
              categoryId: updatedBudget.categoryId,
              spent: newSpent,
              amount: budgetAmount,
              percent,
              isExceeded,
            },
          },
        });

        this.notificationGateway.sendNotification(userId, notification);
      }
    }
  }
}
