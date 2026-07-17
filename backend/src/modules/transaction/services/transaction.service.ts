import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BudgetType,
  Currency,
  TransactionType,
  TransactionStatus,
} from 'generated/prisma/client';
import { Prisma } from 'generated/prisma/client';
import {
  CategoryRepository,
  TransactionRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateTransactionDto } from '../dto/CreateTransactionDto';
import { PaginationTransactionDto } from '../dto/PaginationTransactionDto';
import { UpdateTransactionDto } from '../dto/UpdateTransactionDto';
@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    // Validate dữ liệu
    await this.validateTransaction(userId, dto);

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.transactionRepository.prisma.$transaction(async (tx) => {
      let transaction;

      switch (dto.type) {
        case TransactionType.INCOME:
          transaction = await this.createIncome(tx, userId, dto);
          break;
        case TransactionType.EXPENSE:
          transaction = await this.createExpense(tx, userId, dto);
          break;
        case TransactionType.TRANSFER:
          transaction = await this.createTransfer(tx, userId, dto);
          break;
        default:
          throw new BadRequestException('Loại giao dịch không hợp lệ');
      }

      return {
        message: 'Tạo giao dịch thành công',
        data: transaction,
      };
    });
  }

  private async validateTransaction(userId: string, dto: CreateTransactionDto) {
    // Validate cho từng loại giao dịch
    switch (dto.type) {
      case TransactionType.INCOME:
      case TransactionType.EXPENSE:
        if (!dto.walletId) {
          throw new BadRequestException('Vui lòng chọn ví');
        }
        if (!dto.categoryId) {
          throw new BadRequestException('Vui lòng chọn danh mục');
        }
        break;

      case TransactionType.TRANSFER:
        if (!dto.fromWalletId || !dto.toWalletId) {
          throw new BadRequestException('Vui lòng chọn ví nguồn và ví đích');
        }
        if (dto.fromWalletId === dto.toWalletId) {
          throw new BadRequestException(
            'Ví nguồn và ví đích không được trùng nhau',
          );
        }
        break;
    }

    // Kiểm tra ví thuộc về user
    if (dto.walletId) {
      await this.validateWalletOwnership(userId, dto.walletId);
    }
    if (dto.fromWalletId) {
      await this.validateWalletOwnership(userId, dto.fromWalletId);
    }
    if (dto.toWalletId) {
      await this.validateWalletOwnership(userId, dto.toWalletId);
    }

    // Kiểm tra danh mục thuộc về user và cùng loại
    if (dto.categoryId) {
      const category = await this.categoryRepository.findFirst({
        where: {
          id: dto.categoryId,
          userId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Không tìm thấy danh mục');
      }

      // Kiểm tra category cùng loại với transaction
      if (
        (dto.type === TransactionType.INCOME && category.type !== 'INCOME') ||
        (dto.type === TransactionType.EXPENSE && category.type !== 'EXPENSE')
      ) {
        throw new BadRequestException(
          'Danh mục không phù hợp với loại giao dịch',
        );
      }
    }
  }

  private async validateWalletOwnership(userId: string, walletId: string) {
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

    return wallet;
  }

  private async createIncome(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateTransactionDto,
  ) {
    // Tạo transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.INCOME,
        amount: dto.amount,
        currency: dto.currency ?? Currency.VND,
        description: dto.description,
        note: dto.note,
        date: dto.date ? new Date(dto.date) : new Date(),
        status: dto.status || TransactionStatus.COMPLETED,
        walletId: dto.walletId,
        categoryId: dto.categoryId,
        metadata: dto.metadata,
        reference: dto.reference,
      },
      include: {
        wallet: true,
        category: true,
      },
    });

    // Cập nhật số dư ví nếu trạng thái là COMPLETED
    if (
      transaction.status === TransactionStatus.COMPLETED &&
      transaction.walletId
    ) {
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });
    }

    return transaction;
  }

  private async createExpense(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateTransactionDto,
  ) {
    // Tạo transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.EXPENSE,
        amount: dto.amount,
        currency: dto.currency ?? Currency.VND,
        description: dto.description,
        note: dto.note,
        date: dto.date ? new Date(dto.date) : new Date(),
        status: dto.status || TransactionStatus.COMPLETED,
        walletId: dto.walletId,
        categoryId: dto.categoryId,
        metadata: dto.metadata,
        reference: dto.reference,
      },
      include: {
        wallet: true,
        category: true,
      },
    });

    // Cập nhật số dư ví nếu trạng thái là COMPLETED
    if (
      transaction.status === TransactionStatus.COMPLETED &&
      transaction.walletId
    ) {
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            decrement: transaction.amount,
          },
        },
      });
    }

    if (
      transaction.status === TransactionStatus.COMPLETED &&
      transaction.categoryId
    ) {
      await this.adjustBudgetSpent(
        tx,
        userId,
        {
          categoryId: transaction.categoryId,
          date: transaction.date,
          amount: transaction.amount,
        },
        'increment',
      );
    }

    return transaction;
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
  ) {
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
    });

    if (!budget) {
      return;
    }

    await tx.budget.update({
      where: {
        id: budget.id,
      },
      data: {
        spent: {
          [mode]: transaction.amount,
        },
      },
    });
  }

  private async createTransfer(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateTransactionDto,
  ) {
    // Tạo transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.TRANSFER,
        amount: dto.amount,
        currency: dto.currency || 'VND',
        description: dto.description || 'Chuyển khoản',
        note: dto.note,
        date: dto.date ? new Date(dto.date) : new Date(),
        status: dto.status || TransactionStatus.COMPLETED,
        fromWalletId: dto.fromWalletId,
        toWalletId: dto.toWalletId,
        metadata: dto.metadata,
        reference: dto.reference,
      },
      include: {
        fromWallet: true,
        toWallet: true,
      },
    });

    // Cập nhật số dư 2 ví nếu trạng thái là COMPLETED
    if (transaction.status === TransactionStatus.COMPLETED) {
      // Trừ tiền từ ví nguồn
      await tx.wallet.update({
        where: { id: transaction.fromWalletId! },
        data: {
          balance: {
            decrement: transaction.amount,
          },
        },
      });

      // Cộng tiền vào ví đích
      await tx.wallet.update({
        where: { id: transaction.toWalletId! },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });
    }

    return transaction;
  }

  async update(
    transactionId: string,
    userId: string,
    dto: UpdateTransactionDto,
  ) {
    // Kiểm tra transaction tồn tại và thuộc về user
    const existing = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Không cho phép thay đổi loại giao dịch
    if (dto.type && dto.type !== existing.type) {
      throw new BadRequestException('Không thể thay đổi loại giao dịch');
    }

    // Validate dữ liệu cập nhật
    await this.validateUpdate(userId, existing, dto);

    const needAdjustBudget =
      existing.type === TransactionType.EXPENSE &&
      (dto.amount !== undefined ||
        dto.categoryId !== undefined ||
        dto.date !== undefined ||
        dto.status !== undefined);

    // Sử dụng transaction để đảm bảo tính toàn vẹn
    return await this.transactionRepository.prisma.$transaction(async (tx) => {
      // Nếu thay đổi số tiền hoặc ví, cần điều chỉnh số dư
      const needAdjustBalance =
        dto.amount !== undefined ||
        dto.walletId !== undefined ||
        dto.fromWalletId !== undefined ||
        dto.toWalletId !== undefined ||
        dto.status !== undefined;

      // Hoàn tác tác động của transaction cũ nếu trạng thái là COMPLETED và có thay đổi
      if (
        needAdjustBalance &&
        existing.status === TransactionStatus.COMPLETED
      ) {
        await this.revertBalance(tx, existing);
      }

      if (needAdjustBudget && existing.status === TransactionStatus.COMPLETED) {
        await this.adjustBudgetSpent(
          tx,
          userId,
          {
            categoryId: existing.categoryId,
            date: existing.date,
            amount: existing.amount,
          },
          'decrement',
        );
      }

      // Cập nhật transaction
      const transactionData: Prisma.TransactionUpdateInput = {
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
        note: dto.note,
        status: dto.status,
        metadata: dto.metadata,
        reference: dto.reference,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
        ...(dto.categoryId === undefined ? {} : { categoryId: dto.categoryId }),
        ...(dto.walletId === undefined ? {} : { walletId: dto.walletId }),
        ...(dto.fromWalletId === undefined
          ? {}
          : { fromWalletId: dto.fromWalletId }),
        ...(dto.toWalletId === undefined ? {} : { toWalletId: dto.toWalletId }),
      };

      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: transactionData,
        include: {
          wallet: true,
          fromWallet: true,
          toWallet: true,
          category: true,
        },
      });

      // Áp dụng tác động mới nếu trạng thái là COMPLETED
      if (transaction.status === TransactionStatus.COMPLETED) {
        await this.applyBalance(tx, transaction);
      }

      if (
        transaction.status === TransactionStatus.COMPLETED &&
        transaction.type === TransactionType.EXPENSE
      ) {
        await this.adjustBudgetSpent(
          tx,
          userId,
          {
            categoryId: transaction.categoryId,
            date: transaction.date,
            amount: transaction.amount,
          },
          'increment',
        );
      }

      return {
        message: 'Cập nhật giao dịch thành công',
        data: transaction,
      };
    });
  }

  private async validateUpdate(
    userId: string,
    existing: any,
    dto: UpdateTransactionDto,
  ) {
    // Validate wallet ownership cho các thay đổi
    if (dto.walletId && dto.walletId !== existing.walletId) {
      await this.validateWalletOwnership(userId, dto.walletId);
    }
    if (dto.fromWalletId && dto.fromWalletId !== existing.fromWalletId) {
      await this.validateWalletOwnership(userId, dto.fromWalletId);
    }
    if (dto.toWalletId && dto.toWalletId !== existing.toWalletId) {
      await this.validateWalletOwnership(userId, dto.toWalletId);
    }

    // Validate category
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.categoryRepository.findFirst({
        where: {
          id: dto.categoryId,
          userId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Không tìm thấy danh mục');
      }

      // Kiểm tra category cùng loại với transaction
      if (
        (existing.type === TransactionType.INCOME &&
          category.type !== 'INCOME') ||
        (existing.type === TransactionType.EXPENSE &&
          category.type !== 'EXPENSE')
      ) {
        throw new BadRequestException(
          'Danh mục không phù hợp với loại giao dịch',
        );
      }
    }

    // Validate transfer
    if (existing.type === TransactionType.TRANSFER) {
      if (
        dto.fromWalletId &&
        dto.toWalletId &&
        dto.fromWalletId === dto.toWalletId
      ) {
        throw new BadRequestException(
          'Ví nguồn và ví đích không được trùng nhau',
        );
      }
    }
  }

  private async revertBalance(tx: Prisma.TransactionClient, transaction: any) {
    switch (transaction.type) {
      case TransactionType.INCOME:
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

      case TransactionType.EXPENSE:
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

      case TransactionType.TRANSFER:
        if (transaction.fromWalletId) {
          await tx.wallet.update({
            where: { id: transaction.fromWalletId },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });
        }
        if (transaction.toWalletId) {
          await tx.wallet.update({
            where: { id: transaction.toWalletId },
            data: {
              balance: {
                decrement: transaction.amount,
              },
            },
          });
        }
        break;
    }
  }

  private async applyBalance(tx: Prisma.TransactionClient, transaction: any) {
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

  async findAll(userId: string, query: PaginationTransactionDto) {
    const {
      page,
      limit,
      search,
      type,
      status,
      walletId,
      categoryId,
      fromDate,
      toDate,
      sortBy,
      order,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { note: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
      ...(walletId && {
        OR: [
          { walletId },
          { fromWalletId: walletId },
          { toWalletId: walletId },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(fromDate && {
        date: {
          gte: new Date(fromDate),
        },
      }),
      ...(toDate && {
        date: {
          lte: new Date(toDate + 'T23:59:59.999Z'),
        },
      }),
    };

    const orderBy = sortBy ? { [sortBy]: order } : { date: 'desc' as const };

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          wallet: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          fromWallet: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          toWallet: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      }),
      this.transactionRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách giao dịch thành công',
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
      include: {
        wallet: true,
        fromWallet: true,
        toWallet: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    return {
      message: 'Lấy thông tin giao dịch thành công',
      data: transaction,
    };
  }

  async remove(transactionId: string, userId: string) {
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

    // Sử dụng transaction để đảm bảo tính toàn vẹn
    await this.transactionRepository.prisma.$transaction(async (tx) => {
      // Hoàn tác tác động lên số dư ví nếu trạng thái là COMPLETED
      if (transaction.status === TransactionStatus.COMPLETED) {
        await this.revertBalance(tx, transaction);
      }

      if (
        transaction.status === TransactionStatus.COMPLETED &&
        transaction.type === TransactionType.EXPENSE
      ) {
        await this.adjustBudgetSpent(
          tx,
          userId,
          {
            categoryId: transaction.categoryId,
            date: transaction.date,
            amount: transaction.amount,
          },
          'decrement',
        );
      }

      // Soft delete transaction
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    return {
      message: 'Xóa giao dịch thành công',
    };
  }

  async getStatistics(userId: string, fromDate?: string, toDate?: string) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      status: TransactionStatus.COMPLETED,
      ...(fromDate && {
        date: {
          gte: new Date(fromDate),
        },
      }),
      ...(toDate && {
        date: {
          lte: new Date(toDate + 'T23:59:59.999Z'),
        },
      }),
    };

    // Thống kê theo loại
    const [incomeStats, expenseStats, totalStats] = await Promise.all([
      // Tổng thu nhập
      this.transactionRepository.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Tổng chi tiêu
      this.transactionRepository.aggregate({
        where: {
          ...where,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Tổng số giao dịch
      this.transactionRepository.count({
        where,
      }),
    ]);

    // Chuyển đổi Decimal sang number và xử lý null với safe access
    const totalIncome = incomeStats._sum?.amount
      ? Number(incomeStats._sum.amount)
      : 0;
    const totalExpense = expenseStats._sum?.amount
      ? Number(expenseStats._sum.amount)
      : 0;

    // Thống kê theo danh mục (top 5)
    const categoryStats = await this.transactionRepository.groupBy({
      by: ['categoryId'],
      where: {
        ...where,
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    });

    // Lấy thông tin danh mục
    const categoryIds = categoryStats
      .filter((stat) => stat.categoryId)
      .map((stat) => stat.categoryId!);

    const categories = await this.categoryRepository.findMany({
      where: {
        id: {
          in: categoryIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      },
      {} as Record<string, any>,
    );

    const enrichedCategoryStats = categoryStats.map((stat) => ({
      ...stat,
      amount: stat._sum?.amount ? Number(stat._sum.amount) : 0,
      category: stat.categoryId ? categoryMap[stat.categoryId] : null,
    }));

    // Thống kê theo ví
    const walletStats = await this.transactionRepository.groupBy({
      by: ['walletId'],
      where: {
        ...where,
        walletId: {
          not: null,
        },
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE],
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Lấy thông tin ví
    const walletIds = walletStats
      .filter((stat) => stat.walletId)
      .map((stat) => stat.walletId!);

    const wallets = await this.walletRepository.findMany({
      where: {
        id: {
          in: walletIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    });

    const walletMap = wallets.reduce(
      (acc, w) => {
        acc[w.id] = w;
        return acc;
      },
      {} as Record<string, any>,
    );

    const enrichedWalletStats = walletStats.map((stat) => ({
      ...stat,
      amount: stat._sum?.amount ? Number(stat._sum.amount) : 0,
      wallet: stat.walletId ? walletMap[stat.walletId] : null,
    }));

    return {
      message: 'Lấy thống kê thành công',
      data: {
        summary: {
          totalTransactions: totalStats,
          totalIncome: totalIncome,
          totalExpense: totalExpense,
          netAmount: totalIncome - totalExpense,
          incomeCount: incomeStats._count || 0,
          expenseCount: expenseStats._count || 0,
        },
        topCategories: enrichedCategoryStats,
        walletStats: enrichedWalletStats,
      },
    };
  }
}
