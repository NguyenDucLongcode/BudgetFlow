import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { getRefreshKey } from 'src/common/utils/redis.key.hepler';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getSessions(userId: string) {
    // Lấy toàn bộ session của user từ cơ sở dữ liệu
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
    });

    return {
      message: 'Get sessions successfully',
      data: sessions,
    };
  }

  async removeSession(userId: string, deviceId: string) {
    const redis = this.redisService.getClient();

    // Kiểm tra xem session có tồn tại hay không
    const session = await this.prisma.userSession.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Xóa refresh token trong Redis
    await redis.del(getRefreshKey(userId, deviceId));

    // Xóa session trong DB
    await this.prisma.userSession.delete({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });

    return {
      message: 'Session removed successfully',
    };
  }
}
