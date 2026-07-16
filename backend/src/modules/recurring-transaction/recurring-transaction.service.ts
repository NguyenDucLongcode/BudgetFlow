import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoryType,
  Prisma,
  RecurringFrequency,
  TransactionType,
} from 'generated/prisma/client';
import {
  CategoryRepository,
  RecurringTransactionRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateRecurringTransactionDto } from './dto/CreateRecurringTransactionDto';
import { UpdateRecurringTransactionDto } from './dto/UpdateRecurringTransactionDto';
import { PaginationRecurringTransactionDto } from './dto/PaginationRecurringTransactionDto';

@Injectable()
export class RecurringTransactionService {
  constructor(
    private readonly recurringTransactionRepository: RecurringTransactionRepository,
    private readonly walletRepository: WalletRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(userId: string, dto: CreateRecurringTransactionDto) {
    await this.validateOwnership(
      userId,
      dto.walletId,
      dto.categoryId,
      dto.type,
    );

    if (new Date(dto.endDate ?? dto.startDate) < new Date(dto.startDate)) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (new Date(dto.nextRunDate) < new Date(dto.startDate)) {
      throw new BadRequestException(
        'Ngày chạy tiếp theo phải sau ngày bắt đầu',
      );
    }

    const recurringTransaction =
      await this.recurringTransactionRepository.create({
        data: {
          userId,
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          name: dto.name,
          amount: dto.amount,
          type: dto.type,
          currency: dto.currency,
          frequency: dto.frequency,
          interval: dto.interval,
          startDate: new Date(dto.startDate),
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          nextRunDate: new Date(dto.nextRunDate),
          isActive: dto.isActive,
          description: dto.description,
          metadata: dto.metadata,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return {
      message: 'Tạo giao dịch định kỳ thành công',
      data: recurringTransaction,
    };
  }

  private async validateOwnership(
    userId: string,
    walletId: string,
    categoryId?: string,
    type?: TransactionType,
  ) {
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

    if (categoryId) {
      const category = await this.categoryRepository.findFirst({
        where: {
          id: categoryId,
          userId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Không tìm thấy danh mục');
      }

      if (
        type === TransactionType.INCOME &&
        category.type !== CategoryType.INCOME
      ) {
        throw new BadRequestException(
          'Danh mục không phù hợp với loại giao dịch',
        );
      }

      if (
        type === TransactionType.EXPENSE &&
        category.type !== CategoryType.EXPENSE
      ) {
        throw new BadRequestException(
          'Danh mục không phù hợp với loại giao dịch',
        );
      }
    }
  }

  async update(
    recurringTransactionId: string,
    userId: string,
    dto: UpdateRecurringTransactionDto,
  ) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    const nextType = dto.type ?? recurringTransaction.type;
    const nextWalletId = dto.walletId ?? recurringTransaction.walletId;
    const nextCategoryId =
      dto.categoryId ?? recurringTransaction.categoryId ?? undefined;

    if (dto.walletId || dto.categoryId || dto.type) {
      await this.validateOwnership(
        userId,
        nextWalletId,
        nextCategoryId,
        nextType,
      );
    }

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : recurringTransaction.startDate;
    const nextEndDate =
      dto.endDate === undefined
        ? recurringTransaction.endDate
        : dto.endDate
          ? new Date(dto.endDate)
          : null;
    const nextRunDate = dto.nextRunDate
      ? new Date(dto.nextRunDate)
      : recurringTransaction.nextRunDate;

    if (nextEndDate && nextEndDate < nextStartDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (nextRunDate < nextStartDate) {
      throw new BadRequestException(
        'Ngày chạy tiếp theo phải sau ngày bắt đầu',
      );
    }

    const updatedRecurringTransaction =
      await this.recurringTransactionRepository.update({
        where: {
          id: recurringTransactionId,
        },
        data: {
          ...dto,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate:
            dto.endDate === undefined
              ? undefined
              : dto.endDate
                ? new Date(dto.endDate)
                : null,
          nextRunDate: dto.nextRunDate ? new Date(dto.nextRunDate) : undefined,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return {
      message: 'Cập nhật giao dịch định kỳ thành công',
      data: updatedRecurringTransaction,
    };
  }

  async findAll(userId: string, query: PaginationRecurringTransactionDto) {
    const {
      page,
      limit,
      search,
      type,
      frequency,
      walletId,
      categoryId,
      isActive,
      sortBy,
      order,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RecurringTransactionWhereInput = {
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
        ],
      }),
      ...(type && { type }),
      ...(frequency && { frequency }),
      ...(walletId && { walletId }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = sortBy
      ? { [sortBy]: order }
      : { nextRunDate: 'desc' as const };

    const [recurringTransactions, total] = await Promise.all([
      this.recurringTransactionRepository.findMany({
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
          category: {
            select: {
              id: true,
              name: true,
              type: true,
              icon: true,
              color: true,
            },
          },
        },
      }),
      this.recurringTransactionRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách giao dịch định kỳ thành công',
      data: recurringTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(recurringTransactionId: string, userId: string) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    return {
      message: 'Lấy thông tin giao dịch định kỳ thành công',
      data: recurringTransaction,
    };
  }

  async remove(recurringTransactionId: string, userId: string) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    await this.recurringTransactionRepository.update({
      where: { id: recurringTransactionId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa giao dịch định kỳ thành công',
    };
  }

  private addInterval(
    date: Date,
    frequency: RecurringFrequency,
    interval: number,
  ) {
    const nextDate = new Date(date);

    switch (frequency) {
      case RecurringFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case RecurringFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + interval * 7);
        break;
      case RecurringFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case RecurringFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  async markAsRun(
    recurringTransactionId: string,
    userId: string,
    runDate?: string,
  ) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    const executedAt = runDate ? new Date(runDate) : new Date();
    const nextRunDate = this.addInterval(
      executedAt,
      recurringTransaction.frequency,
      recurringTransaction.interval,
    );

    const updatedRecurringTransaction =
      await this.recurringTransactionRepository.update({
        where: { id: recurringTransactionId },
        data: {
          lastRunDate: executedAt,
          nextRunDate,
          isActive: recurringTransaction.endDate
            ? nextRunDate <= recurringTransaction.endDate
            : recurringTransaction.isActive,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return {
      message: 'Đánh dấu giao dịch định kỳ đã chạy thành công',
      data: updatedRecurringTransaction,
    };
  }

  async pause(recurringTransactionId: string, userId: string) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    if (!recurringTransaction.isActive) {
      return {
        message: 'Giao dịch định kỳ đã ở trạng thái tạm dừng',
        data: recurringTransaction,
      };
    }

    const updatedRecurringTransaction =
      await this.recurringTransactionRepository.update({
        where: { id: recurringTransactionId },
        data: {
          isActive: false,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return {
      message: 'Tạm dừng giao dịch định kỳ thành công',
      data: updatedRecurringTransaction,
    };
  }

  async resume(recurringTransactionId: string, userId: string) {
    const recurringTransaction =
      await this.recurringTransactionRepository.findFirst({
        where: {
          id: recurringTransactionId,
          userId,
          deletedAt: null,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }

    if (recurringTransaction.isActive) {
      return {
        message: 'Giao dịch định kỳ đã ở trạng thái hoạt động',
        data: recurringTransaction,
      };
    }

    const updatedRecurringTransaction =
      await this.recurringTransactionRepository.update({
        where: { id: recurringTransactionId },
        data: {
          isActive: true,
          nextRunDate: recurringTransaction.nextRunDate,
        },
        include: {
          wallet: true,
          category: true,
        },
      });

    return {
      message: 'Kích hoạt lại giao dịch định kỳ thành công',
      data: updatedRecurringTransaction,
    };
  }
}
