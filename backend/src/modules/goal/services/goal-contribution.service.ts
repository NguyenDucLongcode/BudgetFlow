import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { GoalRepository } from 'src/infrastructure/prisma/repositories';
import { GoalContributionRepository } from 'src/infrastructure/prisma/repositories';
import { WalletRepository } from 'src/infrastructure/prisma/repositories';
import { Prisma } from 'generated/prisma/client';
import { CreateContributionDto } from '../dto/CreateContributionDto';
import { UpdateContributionDto } from '../dto/UpdateContributionDto';
import { ContributionQueryDto } from '../dto/ContributionQueryDto';

@Injectable()
export class GoalContributionService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly goalContributionRepository: GoalContributionRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async addContribution(
    goalId: string,
    userId: string,
    dto: CreateContributionDto,
  ) {
    // Kiểm tra goal tồn tại và thuộc về user
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

    if (goal.status === 'COMPLETED') {
      throw new BadRequestException(
        'Mục tiêu đã hoàn thành, không thể đóng góp thêm',
      );
    }

    if (goal.status === 'CANCELLED') {
      throw new BadRequestException('Mục tiêu đã bị hủy');
    }

    // Kiểm tra số tiền đóng góp
    if (dto.amount <= 0) {
      throw new BadRequestException('Số tiền đóng góp phải lớn hơn 0');
    }

    // Kiểm tra wallet nếu có
    if (dto.walletId) {
      const wallet = await this.walletRepository.findFirst({
        where: {
          id: dto.walletId,
          userId,
          deletedAt: null,
        },
      });

      if (!wallet) {
        throw new NotFoundException('Không tìm thấy ví');
      }

      // Kiểm tra số dư ví
      if (wallet.balance.toNumber() < dto.amount) {
        throw new BadRequestException(
          `Số dư ví không đủ (${wallet.balance.toNumber()} < ${dto.amount})`,
        );
      }
    }

    // Xử lý transaction (nếu dùng Prisma transaction)
    const result = await this.goalRepository.prisma.$transaction(async (tx) => {
      // 1. Tạo contribution
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          walletId: dto.walletId,
          amount: dto.amount,
          contributionDate: dto.contributionDate || new Date(),
          note: dto.note,
          transactionId: dto.transactionId,
        },
      });

      // 2. Cập nhật savedAmount của goal
      await tx.goal.update({
        where: { id: goalId },
        data: {
          savedAmount: {
            increment: dto.amount,
          },
        },
      });

      // 3. Cập nhật số dư wallet (nếu có walletId)
      if (dto.walletId) {
        await tx.wallet.update({
          where: { id: dto.walletId },
          data: {
            balance: {
              decrement: dto.amount,
            },
          },
        });
      }

      return contribution;
    });

    return {
      message: 'Đóng góp vào mục tiêu thành công',
      data: result,
    };
  }

  // =========================
  // LẤY DANH SÁCH CONTRIBUTIONS CỦA GOAL
  // =========================
  async getContributions(
    goalId: string,
    userId: string,
    query: ContributionQueryDto,
  ) {
    const { page = 1, limit = 20, fromDate, toDate } = query;

    // Kiểm tra goal tồn tại
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

    const skip = (page - 1) * limit;

    const where: Prisma.GoalContributionWhereInput = {
      goalId,
      ...(fromDate && {
        contributionDate: {
          gte: new Date(fromDate),
        },
      }),
      ...(toDate && {
        contributionDate: {
          lte: new Date(toDate),
        },
      }),
    };

    const [contributions, total] = await Promise.all([
      this.goalContributionRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          contributionDate: 'desc',
        },
        include: {
          wallet: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      }),
      this.goalContributionRepository.count({ where }),
    ]);

    return {
      message: 'Lấy danh sách đóng góp thành công',
      data: contributions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      summary: {
        totalContributions: total,
        totalAmount: await this.getTotalContribution(goalId),
      },
    };
  }

  // =========================
  // LẤY CHI TIẾT 1 CONTRIBUTION
  // =========================
  async getContribution(
    goalId: string,
    contributionId: string,
    userId: string,
  ) {
    // Kiểm tra goal tồn tại
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

    const contribution = await this.goalContributionRepository.findFirst({
      where: {
        id: contributionId,
        goalId,
      },
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        transaction: {
          select: {
            id: true,
            description: true,
            amount: true,
            type: true,
          },
        },
      },
    });

    if (!contribution) {
      throw new NotFoundException('Không tìm thấy đóng góp');
    }

    return {
      message: 'Lấy thông tin đóng góp thành công',
      data: contribution,
    };
  }

  // =========================
  // CẬP NHẬT CONTRIBUTION
  // =========================
  async updateContribution(
    goalId: string,
    contributionId: string,
    userId: string,
    dto: UpdateContributionDto,
  ) {
    // Kiểm tra goal tồn tại
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

    // Kiểm tra contribution tồn tại
    const contribution = await this.goalContributionRepository.findFirst({
      where: {
        id: contributionId,
        goalId,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Không tìm thấy đóng góp');
    }

    // Không cho phép cập nhật amount nếu đã có transaction liên kết
    if (dto.amount && contribution.transactionId) {
      throw new BadRequestException(
        'Không thể thay đổi số tiền vì đã có giao dịch liên kết',
      );
    }

    // Cập nhật
    const updated = await this.goalContributionRepository.update({
      where: { id: contributionId },
      data: {
        amount: dto.amount,
        note: dto.note,
        contributionDate: dto.contributionDate,
      },
    });

    // Nếu thay đổi amount, cập nhật lại savedAmount của goal
    if (dto.amount && dto.amount !== contribution.amount.toNumber()) {
      const diff = dto.amount - contribution.amount.toNumber();
      await this.goalRepository.update({
        where: { id: goalId },
        data: {
          savedAmount: {
            increment: diff,
          },
        },
      });
    }

    return {
      message: 'Cập nhật đóng góp thành công',
      data: updated,
    };
  }

  // =========================
  // XÓA CONTRIBUTION
  // =========================
  async removeContribution(
    goalId: string,
    contributionId: string,
    userId: string,
  ) {
    // Kiểm tra goal tồn tại
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

    // Kiểm tra contribution tồn tại
    const contribution = await this.goalContributionRepository.findFirst({
      where: {
        id: contributionId,
        goalId,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Không tìm thấy đóng góp');
    }

    // Xóa contribution và rollback
    await this.goalRepository.prisma.$transaction(async (tx) => {
      // 1. Xóa contribution
      await tx.goalContribution.delete({
        where: { id: contributionId },
      });

      // 2. Trừ lại savedAmount của goal
      await tx.goal.update({
        where: { id: goalId },
        data: {
          savedAmount: {
            decrement: contribution.amount,
          },
        },
      });

      // 3. Cộng lại số dư wallet (nếu có)
      if (contribution.walletId) {
        await tx.wallet.update({
          where: { id: contribution.walletId },
          data: {
            balance: {
              increment: contribution.amount,
            },
          },
        });
      }
    });

    return {
      message: 'Xóa đóng góp thành công',
    };
  }

  // =========================
  // XÓA TẤT CẢ CONTRIBUTIONS CỦA GOAL
  // =========================
  async clearContributions(goalId: string, userId: string) {
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

    // Lấy tổng số tiền đã đóng góp
    const total = await this.getTotalContribution(goalId);

    await this.goalRepository.prisma.$transaction(async (tx) => {
      // 1. Xóa tất cả contributions
      await tx.goalContribution.deleteMany({
        where: { goalId },
      });

      // 2. Reset savedAmount về 0
      await tx.goal.update({
        where: { id: goalId },
        data: {
          savedAmount: 0,
        },
      });

      // TODO: Cộng lại số dư cho các wallet
      // Cần lấy danh sách wallet và cộng lại
    });

    return {
      message: `Đã xóa tất cả đóng góp của mục tiêu "${goal.name}"`,
      data: {
        deletedAmount: total,
      },
    };
  }

  // =========================
  // HELPER: TÍNH TỔNG ĐÓNG GÓP
  // =========================
  async getTotalContribution(goalId: string): Promise<number> {
    const result = await this.goalContributionRepository.aggregate({
      where: { goalId },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  // =========================
  // LẤY THỐNG KÊ ĐÓNG GÓP THEO THÁNG
  // =========================
  async getContributionStats(goalId: string, userId: string) {
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

    // Lấy tất cả contributions
    const contributions = await this.goalContributionRepository.findMany({
      where: { goalId },
      orderBy: {
        contributionDate: 'asc',
      },
    });

    // Nhóm theo tháng
    const stats = contributions.reduce(
      (acc, curr) => {
        const month = curr.contributionDate.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            month,
            count: 0,
            total: 0,
            average: 0,
          };
        }
        acc[month].count += 1;
        acc[month].total += curr.amount.toNumber();
        acc[month].average = acc[month].total / acc[month].count;
        return acc;
      },
      {} as Record<
        string,
        { month: string; count: number; total: number; average: number }
      >,
    );

    return {
      message: 'Thống kê đóng góp thành công',
      data: {
        goalId,
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount.toNumber(),
        progress:
          (goal.savedAmount.toNumber() / goal.targetAmount.toNumber()) * 100,
        stats: Object.values(stats),
      },
    };
  }
}
