import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, BudgetType, CategoryType } from 'generated/prisma/client';
import {
  BudgetRepository,
  CategoryRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateBudgetDto } from './dto/CreateBudgetDto';
import { UpdateBudgetDto } from './dto/UpdateBudgetDto';
import { PaginationBudgetDto } from './dto/PaginationBudgetDto';

@Injectable()
export class BudgetService {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(userId: string, dto: CreateBudgetDto) {
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

    if (
      (dto.type === BudgetType.SPENDING &&
        category.type !== CategoryType.EXPENSE) ||
      (dto.type === BudgetType.INCOME && category.type !== CategoryType.INCOME)
    ) {
      throw new BadRequestException(
        'Danh mục không phù hợp với loại ngân sách',
      );
    }

    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const budget = await this.budgetRepository.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        spent: 0,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        period: dto.period,
        type: dto.type,
        alertThreshold: dto.alertThreshold,
        isAlertEnabled: dto.isAlertEnabled,
        description: dto.description,
        notes: dto.notes,
      },
      include: {
        category: true,
      },
    });

    return {
      message: 'Tạo ngân sách thành công',
      data: budget,
    };
  }

  async update(budgetId: string, userId: string, dto: UpdateBudgetDto) {
    const budget = await this.budgetRepository.findFirst({
      where: {
        id: budgetId,
        userId,
        deletedAt: null,
      },
    });

    if (!budget) {
      throw new NotFoundException('Không tìm thấy ngân sách');
    }

    const nextType = dto.type ?? budget.type;
    const nextCategoryId = dto.categoryId ?? budget.categoryId;

    if (dto.categoryId || dto.type) {
      const category = await this.categoryRepository.findFirst({
        where: {
          id: nextCategoryId,
          userId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Không tìm thấy danh mục');
      }

      if (
        (nextType === BudgetType.SPENDING &&
          category.type !== CategoryType.EXPENSE) ||
        (nextType === BudgetType.INCOME &&
          category.type !== CategoryType.INCOME)
      ) {
        throw new BadRequestException(
          'Danh mục không phù hợp với loại ngân sách',
        );
      }
    }

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : budget.startDate;
    const nextEndDate = dto.endDate ? new Date(dto.endDate) : budget.endDate;

    if (nextEndDate < nextStartDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const updatedBudget = await this.budgetRepository.update({
      where: {
        id: budgetId,
      },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        category: true,
      },
    });

    return {
      message: 'Cập nhật ngân sách thành công',
      data: updatedBudget,
    };
  }

  async findAll(userId: string, query: PaginationBudgetDto) {
    const {
      page,
      limit,
      search,
      type,
      period,
      categoryId,
      isActive,
      sortBy,
      order,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BudgetWhereInput = {
      userId,
      deletedAt: null,
      ...(search && {
        OR: [
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            notes: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(type && { type }),
      ...(period && { period }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const orderBy = sortBy
      ? { [sortBy]: order }
      : { startDate: 'desc' as const };

    const [budgets, total] = await Promise.all([
      this.budgetRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
              type: true,
            },
          },
        },
      }),
      this.budgetRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách ngân sách thành công',
      data: budgets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(budgetId: string, userId: string) {
    const budget = await this.budgetRepository.findFirst({
      where: {
        id: budgetId,
        userId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Không tìm thấy ngân sách');
    }

    return {
      message: 'Lấy thông tin ngân sách thành công',
      data: budget,
    };
  }

  async summary(userId: string) {
    const budgets = await this.budgetRepository.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        amount: true,
        spent: true,
        isActive: true,
        isAlertEnabled: true,
      },
    });

    const totals = budgets.reduce(
      (accumulator, budget) => {
        const amount = Number(budget.amount);
        const spent = Number(budget.spent);

        accumulator.totalAllocated += amount;
        accumulator.totalSpent += spent;
        accumulator.totalRemaining += Math.max(amount - spent, 0);

        if (budget.isActive) {
          accumulator.activeBudgets += 1;
        }

        if (budget.isAlertEnabled) {
          accumulator.alertEnabledBudgets += 1;
        }

        if (spent >= amount && amount > 0) {
          accumulator.overBudgetBudgets += 1;
        }

        return accumulator;
      },
      {
        totalAllocated: 0,
        totalSpent: 0,
        totalRemaining: 0,
        activeBudgets: 0,
        alertEnabledBudgets: 0,
        overBudgetBudgets: 0,
      },
    );

    return {
      message: 'Lấy tổng quan ngân sách thành công',
      data: {
        totalBudgets: budgets.length,
        ...totals,
      },
    };
  }

  async remove(budgetId: string, userId: string) {
    const budget = await this.budgetRepository.findFirst({
      where: {
        id: budgetId,
        userId,
        deletedAt: null,
      },
    });

    if (!budget) {
      throw new NotFoundException('Không tìm thấy ngân sách');
    }

    await this.budgetRepository.update({
      where: { id: budgetId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa ngân sách thành công',
    };
  }
}
