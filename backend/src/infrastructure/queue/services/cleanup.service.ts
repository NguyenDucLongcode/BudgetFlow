import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Xóa người dùng không hoạt động trong một khoảng thời gian nhất định (mặc định là 30 ngày)
  async removeInactiveUsers(days = 30) {
    const expiredDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await this.prisma.user.deleteMany({
      where: {
        isActive: false,

        verifyTokenExpiresAt: {
          lt: new Date(),
        },

        createdAt: {
          lt: expiredDate,
        },
      },
    });

    this.logger.log(`Deleted ${result.count} inactive users`);

    return result.count;
  }
}
