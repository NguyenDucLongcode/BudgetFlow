import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalStatus, Prisma } from 'generated/prisma/client';
import {
  GoalRepository,
  WalletRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateGoalDto } from '../dto/CreateGoalDto';
import { UpdateGoalDto } from '../dto/UpdateGoalDto';
import { PaginationGoalDto } from '../dto/PaginationGoalDto';
import { ChangeGoalSavedAmountDto } from '../dto/ChangeGoalSavedAmountDto';

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly walletRepository: WalletRepository,
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

  async create(userId: string, dto: CreateGoalDto) {
    await this.validateWallet(userId, dto.walletId);

    if (new Date(dto.targetDate) < new Date(dto.startDate)) {
      throw new BadRequestException('Ngày mục tiêu phải sau ngày bắt đầu');
    }

    const goal = await this.goalRepository.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        savedAmount: 0,
        currency: dto.currency,
        startDate: new Date(dto.startDate),
        targetDate: new Date(dto.targetDate),
        status: dto.status,
        priority: dto.priority,
        description: dto.description,
        notes: dto.notes,
        icon: dto.icon,
        color: dto.color,
        walletId: dto.walletId,
        reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : null,
        reminderSent: dto.reminderSent,
        isArchived: dto.isArchived,
      },
      include: {
        wallet: true,
      },
    });

    return {
      message: 'Tạo mục tiêu thành công',
      data: goal,
    };
  }

  async update(goalId: string, userId: string, dto: UpdateGoalDto) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : goal.startDate;
    const nextTargetDate = dto.targetDate
      ? new Date(dto.targetDate)
      : goal.targetDate;

    if (nextTargetDate < nextStartDate) {
      throw new BadRequestException('Ngày mục tiêu phải sau ngày bắt đầu');
    }

    await this.validateWallet(
      userId,
      dto.walletId === undefined ? goal.walletId : dto.walletId,
    );

    const updatedGoal = await this.goalRepository.update({
      where: {
        id: goalId,
      },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        reminderDate:
          dto.reminderDate === undefined
            ? undefined
            : dto.reminderDate
              ? new Date(dto.reminderDate)
              : null,
      },
      include: {
        wallet: true,
      },
    });

    return {
      message: 'Cập nhật mục tiêu thành công',
      data: updatedGoal,
    };
  }

  async findAll(userId: string, query: PaginationGoalDto) {
    const {
      page,
      limit,
      search,
      status,
      priority,
      walletId,
      isArchived,
      sortBy,
      order,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GoalWhereInput = {
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
            notes: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(walletId && { walletId }),
      ...(isArchived !== undefined && { isArchived }),
    };

    const orderBy = sortBy
      ? { [sortBy]: order }
      : { targetDate: 'asc' as const };

    const [goals, total] = await Promise.all([
      this.goalRepository.findMany({
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
        },
      }),
      this.goalRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách mục tiêu thành công',
      data: goals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(goalId: string, userId: string) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
      include: {
        wallet: true,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    return {
      message: 'Lấy thông tin mục tiêu thành công',
      data: goal,
    };
  }

  private getGoalNextStatus(
    goalStatus: GoalStatus,
    nextSavedAmount: number,
    targetAmount: number,
  ) {
    if (nextSavedAmount >= targetAmount) {
      return GoalStatus.COMPLETED;
    }

    if (
      goalStatus === GoalStatus.CANCELLED ||
      goalStatus === GoalStatus.PAUSED
    ) {
      return goalStatus;
    }

    return GoalStatus.IN_PROGRESS;
  }

  async adjustSavedAmount(
    goalId: string,
    userId: string,
    dto: ChangeGoalSavedAmountDto,
    mode: 'deposit' | 'withdraw',
  ) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    const amount = Number(dto.amount);
    const currentSavedAmount = Number(goal.savedAmount);

    const nextSavedAmount =
      mode === 'deposit'
        ? Math.min(currentSavedAmount + amount, Number(goal.targetAmount))
        : Math.max(currentSavedAmount - amount, 0);

    const updatedGoal = await this.goalRepository.update({
      where: {
        id: goalId,
      },
      data: {
        savedAmount: nextSavedAmount,
        status: this.getGoalNextStatus(
          goal.status,
          nextSavedAmount,
          Number(goal.targetAmount),
        ),
      },
      include: {
        wallet: true,
      },
    });

    return {
      message:
        mode === 'deposit'
          ? 'Nạp tiền vào mục tiêu thành công'
          : 'Rút tiền khỏi mục tiêu thành công',
      data: updatedGoal,
    };
  }

  async pause(goalId: string, userId: string) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    if (goal.status === GoalStatus.COMPLETED) {
      throw new BadRequestException(
        'Không thể tạm dừng mục tiêu đã hoàn thành',
      );
    }

    const updatedGoal = await this.goalRepository.update({
      where: {
        id: goalId,
      },
      data: {
        status: GoalStatus.PAUSED,
      },
      include: {
        wallet: true,
      },
    });

    return {
      message: 'Tạm dừng mục tiêu thành công',
      data: updatedGoal,
    };
  }

  async resume(goalId: string, userId: string) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    if (goal.status !== GoalStatus.PAUSED) {
      throw new BadRequestException(
        'Mục tiêu hiện tại không ở trạng thái tạm dừng',
      );
    }

    const updatedGoal = await this.goalRepository.update({
      where: {
        id: goalId,
      },
      data: {
        status:
          Number(goal.savedAmount) >= Number(goal.targetAmount)
            ? GoalStatus.COMPLETED
            : GoalStatus.IN_PROGRESS,
      },
      include: {
        wallet: true,
      },
    });

    return {
      message: 'Kích hoạt lại mục tiêu thành công',
      data: updatedGoal,
    };
  }

  async summary(userId: string) {
    const goals = await this.goalRepository.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        targetAmount: true,
        savedAmount: true,
        status: true,
        isArchived: true,
      },
    });

    const totals = goals.reduce(
      (accumulator, goal) => {
        const targetAmount = Number(goal.targetAmount);
        const savedAmount = Number(goal.savedAmount);

        accumulator.totalTargetAmount += targetAmount;
        accumulator.totalSavedAmount += savedAmount;
        accumulator.totalRemainingAmount += Math.max(
          targetAmount - savedAmount,
          0,
        );

        if (goal.status === GoalStatus.COMPLETED) {
          accumulator.completedGoals += 1;
        }

        if (goal.status === GoalStatus.IN_PROGRESS) {
          accumulator.activeGoals += 1;
        }

        if (goal.isArchived) {
          accumulator.archivedGoals += 1;
        }

        return accumulator;
      },
      {
        totalTargetAmount: 0,
        totalSavedAmount: 0,
        totalRemainingAmount: 0,
        activeGoals: 0,
        completedGoals: 0,
        archivedGoals: 0,
      },
    );

    return {
      message: 'Lấy tổng quan mục tiêu thành công',
      data: {
        totalGoals: goals.length,
        ...totals,
      },
    };
  }

  async remove(goalId: string, userId: string) {
    const goal = await this.goalRepository.findFirst({
      where: {
        id: goalId,
        userId,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu');
    }

    await this.goalRepository.update({
      where: { id: goalId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa mục tiêu thành công',
    };
  }
}
