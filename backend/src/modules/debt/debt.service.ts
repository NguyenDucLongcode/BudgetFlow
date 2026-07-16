import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DebtStatus, Prisma } from 'generated/prisma/client';
import {
  DebtRepository,
  TransactionRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateDebtDto } from './dto/CreateDebtDto';
import { UpdateDebtDto } from './dto/UpdateDebtDto';
import { PaginationDebtDto } from './dto/PaginationDebtDto';

@Injectable()
export class DebtService {
  constructor(
    private readonly debtRepository: DebtRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
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
              name: true,
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

    return {
      message: 'Lấy danh sách khoản nợ thành công',
      data: debts,
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

    return {
      message: 'Lấy thông tin khoản nợ thành công',
      data: debt,
    };
  }

  async summary(userId: string) {
    const debts = await this.debtRepository.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
        dueDate: true,
      },
    });

    const now = new Date();

    const totals = debts.reduce(
      (accumulator, debt) => {
        const totalAmount = Number(debt.totalAmount);
        const paidAmount = Number(debt.paidAmount);
        const remainingAmount = Math.max(totalAmount - paidAmount, 0);

        accumulator.totalDebtAmount += totalAmount;
        accumulator.totalPaidAmount += paidAmount;
        accumulator.totalRemainingAmount += remainingAmount;

        if (debt.status === DebtStatus.ACTIVE) {
          accumulator.activeDebts += 1;
        }

        if (debt.status === DebtStatus.OVERDUE) {
          accumulator.overdueDebts += 1;
        }

        if (debt.status === DebtStatus.PAID) {
          accumulator.paidDebts += 1;
        }

        if (debt.dueDate < now && debt.status !== DebtStatus.PAID) {
          accumulator.pastDueDebts += 1;
        }

        return accumulator;
      },
      {
        totalDebtAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
        activeDebts: 0,
        overdueDebts: 0,
        paidDebts: 0,
        pastDueDebts: 0,
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
