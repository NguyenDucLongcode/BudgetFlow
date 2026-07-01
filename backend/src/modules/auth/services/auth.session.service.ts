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

    const deleted = await this.prisma.userSession.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });

    if (!deleted.count) {
      throw new NotFoundException('Session not found');
    }

    await redis.del(getRefreshKey(userId, deviceId));

    return {
      message: 'Session removed successfully',
    };
  }

  async revokeAllUserSessions(userId: string) {
    const redis = this.redisService.getClient();

    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      select: { deviceId: true },
    });

    // Lấy tất cả khóa Redis của các session để xóa
    const keys = sessions.map((s) => getRefreshKey(userId, s.deviceId));

    // Xóa tất cả session của user trong cơ sở dữ liệu
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
