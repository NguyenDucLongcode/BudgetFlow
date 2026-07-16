import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, Prisma } from 'generated/prisma/client';
import {
  DebtPaymentRepository,
  DebtRepository,
  TransactionRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateDebtPaymentDto } from './dto/CreateDebtPaymentDto';
import { UpdateDebtPaymentDto } from './dto/UpdateDebtPaymentDto';
import { PaginationDebtPaymentDto } from './dto/PaginationDebtPaymentDto';

@Injectable()
export class DebtPaymentService {
  constructor(
    private readonly debtPaymentRepository: DebtPaymentRepository,
    private readonly debtRepository: DebtRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

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

  private async getDebtOrFail(userId: string, debtId: string) {
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

    return debt;
  }

  private getUpdatedDebtStatus(paidAmount: number, totalAmount: number) {
    return paidAmount >= totalAmount ? DebtStatus.PAID : DebtStatus.ACTIVE;
  }

  async create(userId: string, dto: CreateDebtPaymentDto) {
    const debt = await this.getDebtOrFail(userId, dto.debtId);
    await this.validateTransaction(userId, dto.transactionId);

    return this.debtPaymentRepository.prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.create({
        data: {
          debtId: dto.debtId,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          method: dto.method,
          note: dto.note,
          transactionId: dto.transactionId,
        },
        include: {
          debt: true,
          transaction: true,
        },
      });

      const updatedPaidAmount = Number(debt.paidAmount) + Number(dto.amount);

      await tx.debt.update({
        where: {
          id: debt.id,
        },
        data: {
          paidAmount: updatedPaidAmount,
          status: this.getUpdatedDebtStatus(
            updatedPaidAmount,
            Number(debt.totalAmount),
          ),
        },
      });

      return {
        message: 'Tạo khoản thanh toán thành công',
        data: payment,
      };
    });
  }

  async update(
    debtPaymentId: string,
    userId: string,
    dto: UpdateDebtPaymentDto,
  ) {
    const payment = await this.debtPaymentRepository.findFirst({
      where: {
        id: debtPaymentId,
        debt: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        debt: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy khoản thanh toán');
    }

    const nextTransactionId =
      dto.transactionId === undefined
        ? payment.transactionId
        : dto.transactionId;
    await this.validateTransaction(userId, nextTransactionId);

    return this.debtPaymentRepository.prisma.$transaction(async (tx) => {
      const nextAmount = dto.amount ?? Number(payment.amount);
      const updatedPaidAmount =
        Number(payment.debt.paidAmount) -
        Number(payment.amount) +
        Number(nextAmount);

      const updatedPayment = await tx.debtPayment.update({
        where: {
          id: debtPaymentId,
        },
        data: {
          amount: dto.amount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
          method: dto.method,
          note: dto.note,
          transactionId:
            dto.transactionId === undefined ? undefined : dto.transactionId,
        },
        include: {
          debt: true,
          transaction: true,
        },
      });

      await tx.debt.update({
        where: {
          id: payment.debtId,
        },
        data: {
          paidAmount: updatedPaidAmount,
          status: this.getUpdatedDebtStatus(
            updatedPaidAmount,
            Number(payment.debt.totalAmount),
          ),
        },
      });

      return {
        message: 'Cập nhật khoản thanh toán thành công',
        data: updatedPayment,
      };
    });
  }

  async findAll(userId: string, query: PaginationDebtPaymentDto) {
    const { page, limit, debtId, method, fromDate, toDate, sortBy, order } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.DebtPaymentWhereInput = {
      debt: {
        userId,
        deletedAt: null,
      },
      ...(debtId && { debtId }),
      ...(method && { method }),
      ...(fromDate || toDate
        ? {
            paymentDate: {
              ...(fromDate && { gte: new Date(fromDate) }),
              ...(toDate && { lte: new Date(toDate) }),
            },
          }
        : {}),
    };

    const orderBy = sortBy
      ? { [sortBy]: order }
      : { paymentDate: 'desc' as const };

    const [payments, total] = await Promise.all([
      this.debtPaymentRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          debt: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              totalAmount: true,
              paidAmount: true,
              currency: true,
            },
          },
          transaction: true,
        },
      }),
      this.debtPaymentRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách khoản thanh toán thành công',
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(debtPaymentId: string, userId: string) {
    const payment = await this.debtPaymentRepository.findFirst({
      where: {
        id: debtPaymentId,
        debt: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        debt: true,
        transaction: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy khoản thanh toán');
    }

    return {
      message: 'Lấy thông tin khoản thanh toán thành công',
      data: payment,
    };
  }

  async remove(debtPaymentId: string, userId: string) {
    const payment = await this.debtPaymentRepository.findFirst({
      where: {
        id: debtPaymentId,
        debt: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        debt: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy khoản thanh toán');
    }

    await this.debtPaymentRepository.prisma.$transaction(async (tx) => {
      await tx.debtPayment.delete({
        where: { id: debtPaymentId },
      });

      const updatedPaidAmount =
        Number(payment.debt.paidAmount) - Number(payment.amount);

      await tx.debt.update({
        where: {
          id: payment.debtId,
        },
        data: {
          paidAmount: Math.max(updatedPaidAmount, 0),
          status: this.getUpdatedDebtStatus(
            Math.max(updatedPaidAmount, 0),
            Number(payment.debt.totalAmount),
          ),
        },
      });
    });

    return {
      message: 'Xóa khoản thanh toán thành công',
    };
  }
}
