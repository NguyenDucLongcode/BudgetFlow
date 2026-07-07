import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { getRefreshKey } from 'src/common/utils/redis.key.hepler';
import { SessionRepository, UserRepository } from 'src/prisma/repositories';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
  ) {}

  async getSessions(userId: string) {
    const sessions = await this.sessionRepository.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
      select: {
        id: true,
        deviceId: true,
        userAgent: true,
        ipAddress: true,
        lastLoginAt: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return {
      message: 'Get sessions successfully',
      data: sessions,
    };
  }

  async removeSession(userId: string, sessionId: string) {
    const redis = this.redisService.getClient();

    const session = await this.sessionRepository.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        userId: true,
        deviceId: true,
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Phiên đăng nhập không tồn tại.');
    }

    await this.sessionRepository.delete({
      where: {
        id: session.id,
      },
    });

    await redis.del(getRefreshKey(userId, session.deviceId));
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

    await this.userRepository.update({
      where: {
        id: userId,
      },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }
}
