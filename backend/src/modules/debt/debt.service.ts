import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DebtStatus,
  DebtType,
  NotificationType,
  PaymentMethod,
  Prisma,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import {
  DebtRepository,
  TransactionRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { NotificationGateway } from 'src/modules/notification/notification.gateway';
import { CreateDebtDto } from './dto/CreateDebtDto';
import { UpdateDebtDto } from './dto/UpdateDebtDto';
import { PaginationDebtDto } from './dto/PaginationDebtDto';
import { CreatePaymentForDebtDto } from './dto/CreatePaymentForDebtDto';

@Injectable()
export class DebtService {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  private async validateWallet(userId: string, walletId?: string | null) {
    if (!walletId) {
      return;
    }

    const wallet = await this.walletRepository.findFirst({
      where: {
        id: walletId,
        userId,
        deletedAt: null,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Không tìm thấy ví');
    }
  }

  private async validateTransaction(
    userId: string,
    transactionId?: string | null,
  ) {
    if (!transactionId) {
      return;
    }

    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }
  }

  async create(userId: string, dto: CreateDebtDto) {
    await this.validateWallet(userId, dto.walletId);
    await this.validateTransaction(userId, dto.transactionId);

    if (new Date(dto.dueDate) < new Date(dto.startDate)) {
      throw new BadRequestException('Ngày đến hạn phải sau ngày bắt đầu');
    }

    const debt = await this.debtRepository.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        totalAmount: dto.totalAmount,
        paidAmount: 0,
        interestRate: dto.interestRate,
        startDate: new Date(dto.startDate),
        dueDate: new Date(dto.dueDate),
        monthlyPayment: dto.monthlyPayment,
        status: dto.status,
        description: dto.description,
        contactName: dto.contactName,
        borrower: dto.borrower,
        accountNumber: dto.accountNumber,
        walletId: dto.walletId,
        note: dto.note,
        transactionId: dto.transactionId,
        reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : null,
        reminderSent: dto.reminderSent,
        currency: dto.currency,
      },
      include: {
        wallet: true,
        transaction: true,
        payments: true,
      },
    });

    return {
      message: 'Tạo khoản nợ thành công',
      data: debt,
    };
  }

  async update(debtId: string, userId: string, dto: UpdateDebtDto) {
    const debt = await this.debtRepository.findFirst({
      where: {
        id: debtId,
        userId,
        deletedAt: null,
      },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy khoản nợ');
    }

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : debt.startDate;
    const nextDueDate = dto.dueDate ? new Date(dto.dueDate) : debt.dueDate;

    if (nextDueDate < nextStartDate) {
      throw new BadRequestException('Ngày đến hạn phải sau ngày bắt đầu');
    }

    await this.validateWallet(
      userId,
      dto.walletId === undefined ? debt.walletId : dto.walletId,
    );
    await this.validateTransaction(
      userId,
      dto.transactionId === undefined ? debt.transactionId : dto.transactionId,
    );

    const updatedDebt = await this.debtRepository.update({
      where: {
        id: debtId,
      },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        reminderDate:
          dto.reminderDate === undefined
            ? undefined
            : dto.reminderDate
              ? new Date(dto.reminderDate)
              : null,
      },
      include: {
        wallet: true,
        transaction: true,
        payments: true,
      },
    });

    return {
      message: 'Cập nhật khoản nợ thành công',
      data: updatedDebt,
    };
  }

  async findAll(userId: string, query: PaginationDebtDto) {
    const { page, limit, search, type, status, walletId, sortBy, order } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.DebtWhereInput = {
      userId,
      deletedAt: null,
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            contactName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            borrower: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
      ...(walletId && { walletId }),
    };

    const orderBy = sortBy ? { [sortBy]: order } : { dueDate: 'desc' as const };

    const [debts, total] = await Promise.all([
      this.debtRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          wallet: {
            select: {
              id: true,
              nameVi: true,
              nameEn: true,
              type: true,
              currency: true,
            },
          },
          transaction: true,
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
          },
        },
      }),
      this.debtRepository.count({ where }),
    ]);

    const now = new Date();
    const debtsWithProgress = debts.map((debt) => {
      const total = Number(debt.totalAmount);
      const paid = Number(debt.paidAmount);
      const remainingAmount = Math.max(0, total - paid);
      const progress =
        total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
      const isOverdue =
        new Date(debt.dueDate) < now && debt.status !== DebtStatus.PAID;
      const status =
        isOverdue && debt.status === DebtStatus.ACTIVE
          ? DebtStatus.OVERDUE
          : debt.status;

      return {
        ...debt,
        status,
        remainingAmount,
        progress,
        percentage: progress,
        isOverdue,
      };
    });

    return {
      message: 'Lấy danh sách khoản nợ thành công',
      data: debtsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(debtId: string, userId: string) {
    const debt = await this.debtRepository.findFirst({
      where: {
        id: debtId,
        userId,
        deletedAt: null,
      },
      include: {
        wallet: true,
        transaction: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy khoản nợ');
    }

    const now = new Date();
    const total = Number(debt.totalAmount);
    const paid = Number(debt.paidAmount);
    const remainingAmount = Math.max(0, total - paid);
    const progress =
      total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
    const isOverdue =
      new Date(debt.dueDate) < now && debt.status !== DebtStatus.PAID;
    const status =
      isOverdue && debt.status === DebtStatus.ACTIVE
        ? DebtStatus.OVERDUE
        : debt.status;

    return {
      message: 'Lấy thông tin khoản nợ thành công',
      data: {
        ...debt,
        status,
        remainingAmount,
        progress,
        percentage: progress,
        isOverdue,
      },
    };
  }

  async summary(userId: string) {
    const debts = await this.debtRepository.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        type: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
      },
    });

    const now = new Date();

    const totals = debts.reduce(
      (acc, debt) => {
        const total = Number(debt.totalAmount);
        const paid = Number(debt.paidAmount);
        const remaining = Math.max(total - paid, 0);
        const isOverdue =
          new Date(debt.dueDate) < now && debt.status !== DebtStatus.PAID;

        acc.totalAmount += total;
        acc.totalPaidAmount += paid;
        acc.totalRemainingAmount += remaining;

        if (debt.type === DebtType.LOAN) {
          acc.loanTotal += total;
          acc.loanPaid += paid;
          acc.loanRemaining += remaining;
          if (debt.status === DebtStatus.ACTIVE) acc.activeLoans += 1;
        } else {
          acc.debtTotal += total;
          acc.debtPaid += paid;
          acc.debtRemaining += remaining;
          if (debt.status === DebtStatus.ACTIVE) acc.activeDebts += 1;
        }

        if (debt.status === DebtStatus.PAID) {
          acc.paidDebts += 1;
        } else if (isOverdue || debt.status === DebtStatus.OVERDUE) {
          acc.overdueDebts += 1;
        }

        return acc;
      },
      {
        totalAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
        loanTotal: 0,
        loanPaid: 0,
        loanRemaining: 0,
        debtTotal: 0,
        debtPaid: 0,
        debtRemaining: 0,
        activeLoans: 0,
        activeDebts: 0,
        paidDebts: 0,
        overdueDebts: 0,
      },
    );

    return {
      message: 'Lấy tổng quan khoản nợ thành công',
      data: {
        totalDebts: debts.length,
        ...totals,
      },
    };
  }

  async addPayment(
    debtId: string,
    userId: string,
    dto: CreatePaymentForDebtDto,
  ) {
    const debt = await this.debtRepository.findFirst({
      where: {
        id: debtId,
        userId,
        deletedAt: null,
      },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy khoản nợ');
    }

    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Khoản nợ đã được thanh toán hoàn tất');
    }

    if (debt.status === DebtStatus.CANCELLED) {
      throw new BadRequestException('Khoản nợ đã bị hủy');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0');
    }

    let wallet: Awaited<ReturnType<typeof this.walletRepository.findFirst>> =
      null;
    if (dto.walletId) {
      wallet = await this.walletRepository.findFirst({
        where: {
          id: dto.walletId,
          userId,
          deletedAt: null,
        },
      });

      if (!wallet) {
        throw new NotFoundException('Không tìm thấy ví thanh toán');
      }

      // Nếu là LOAN (mình đi vay, giờ trả nợ): trừ tiền ví -> kiểm tra số dư ví
      if (
        debt.type === DebtType.LOAN &&
        wallet.balance.toNumber() < dto.amount
      ) {
        throw new BadRequestException(
          `Số dư ví không đủ để thanh toán khoản nợ (${wallet.balance.toNumber().toLocaleString('vi-VN')} < ${dto.amount.toLocaleString('vi-VN')})`,
        );
      }
    }

    const isLoan = debt.type === DebtType.LOAN;
    const paymentDate = dto.paymentDate
      ? new Date(dto.paymentDate)
      : new Date();

    const result = await this.debtRepository.prisma.$transaction(
      async (tx) => {
        // Bước 1: Tạo bản ghi Transaction
        // Nếu là LOAN (Mình đi vay, giờ trả nợ): Type = EXPENSE (Trừ tiền ví)
        // Nếu là DEBT (Mình cho vay, giờ thu tiền về): Type = INCOME (Cộng tiền ví)
        let createdTransaction: { id: string } | null = null;
        if (dto.walletId && wallet) {
          createdTransaction = await tx.transaction.create({
            data: {
              userId,
              walletId: dto.walletId,
              type: isLoan
                ? TransactionType.EXPENSE
                : TransactionType.INCOME,
              amount: dto.amount,
              currency: wallet.currency || debt.currency,
              description: isLoan
                ? `Trả nợ khoản vay: ${debt.name}`
                : `Thu hồi nợ cho vay: ${debt.name}`,
              note: dto.note,
              date: paymentDate,
              status: TransactionStatus.COMPLETED,
            },
          });

          // Bước 2: Cập nhật số dư (balance) của Ví tương ứng
          await tx.wallet.update({
            where: { id: dto.walletId },
            data: {
              balance: isLoan
                ? { decrement: dto.amount }
                : { increment: dto.amount },
            },
          });
        }

        // Bước 3: Tạo bản ghi DebtPayment (lưu debtId, amount, paymentDate, method, transactionId)
        const payment = await tx.debtPayment.create({
          data: {
            debtId,
            amount: dto.amount,
            paymentDate,
            method: dto.method || PaymentMethod.CASH,
            note: dto.note,
            transactionId: createdTransaction?.id,
          },
          include: {
            transaction: true,
          },
        });

        // Bước 4: Cộng số tiền thanh toán vào paidAmount của Debt
        const newPaidAmount =
          Number(debt.paidAmount) + Number(dto.amount);
        const isPaid = newPaidAmount >= Number(debt.totalAmount);

        const updatedDebt = await tx.debt.update({
          where: { id: debtId },
          data: {
            paidAmount: {
              increment: dto.amount,
            },
            ...(isPaid ? { status: DebtStatus.PAID } : {}),
          },
          include: {
            wallet: true,
          },
        });

        // Bước 5: Kiểm tra nếu paidAmount >= totalAmount, chuyển status của Debt thành PAID và bắn thông báo
        let notification: {
          id: string;
          userId: string;
          type: NotificationType;
          title: string;
          message: string;
          metadata: Prisma.JsonValue;
          isRead: boolean;
          readAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
        } | null = null;

        if (isPaid) {
          notification = await tx.notification.create({
            data: {
              userId,
              type: NotificationType.DEBT,
              title: isLoan
                ? 'Chúc mừng! Bạn đã trả xong khoản nợ'
                : 'Đã thu hồi xong khoản cho vay',
              message: isLoan
                ? `Khoản nợ "${debt.name}" với số tiền ${Number(debt.totalAmount).toLocaleString('vi-VN')} VND đã được thanh toán hoàn tất.`
                : `Khoản cho vay "${debt.name}" với số tiền ${Number(debt.totalAmount).toLocaleString('vi-VN')} VND đã được thu hồi đầy đủ.`,
              metadata: {
                debtId: debt.id,
                debtName: debt.name,
                totalAmount: Number(debt.totalAmount),
                paidAmount: newPaidAmount,
              },
            },
          });
        }

        return {
          payment,
          debt: updatedDebt,
          transaction: createdTransaction,
          notification,
        };
      },
    );

    // Bắn WebSocket thông báo chúc mừng user ngoài transaction
    if (result.notification) {
      try {
        this.notificationGateway.sendNotification(userId, result.notification);
      } catch {
        // WebSocket dispatch error should not crash response
      }
    }

    return {
      message: 'Thanh toán khoản nợ thành công',
      data: result.payment,
    };
  }

  async getPayments(debtId: string, userId: string) {
    const debt = await this.debtRepository.findFirst({
      where: {
        id: debtId,
        userId,
        deletedAt: null,
      },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy khoản nợ');
    }

    const payments = await this.debtRepository.prisma.debtPayment.findMany({
      where: {
        debtId,
      },
      orderBy: {
        paymentDate: 'desc',
      },
      include: {
        transaction: true,
      },
    });

    return {
      message: 'Lấy lịch sử thanh toán thành công',
      data: payments,
    };
  }

  async remove(debtId: string, userId: string) {
    const debt = await this.debtRepository.findFirst({
      where: {
        id: debtId,
        userId,
        deletedAt: null,
      },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy khoản nợ');
    }

    await this.debtRepository.update({
      where: { id: debtId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa khoản nợ thành công',
    };
  }
}
