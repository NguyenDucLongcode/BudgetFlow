import { redisService } from "@/lib/redis";
import { RedisKeys } from "@/lib/redis/redis.keys";
import { Role } from "@/src/types/enums";
import { ACCESS_TOKEN_TTL } from "../constants";
import { AccessTokenSession } from "../type";

export class AccessTokenStore {
  /**
   * Lưu session vào Redis
   */
  async save(
    deviceId: string,
    accessToken: string,
    userId: string,
    role: Role,
    ttl = ACCESS_TOKEN_TTL,
  ): Promise<void> {
    const session: AccessTokenSession = {
      accessToken,
      userId,
      role,
      deviceId,
      expiresAt: Date.now() + ttl * 1000,
    };

    await redisService.set(
      RedisKeys.accessToken(deviceId),
      JSON.stringify(session),
      ttl,
    );
  }

  /**
   * Lấy session
   */
  async get(deviceId: string): Promise<AccessTokenSession | null> {
    const data = await redisService.get(RedisKeys.accessToken(deviceId));

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as AccessTokenSession;
    } catch {
      return null;
    }
  }

  /**
   * Chỉ lấy access token
   */
  async getAccessToken(deviceId: string): Promise<string | null> {
    const session = await this.get(deviceId);

    return session?.accessToken ?? null;
  }

  /**
   * Cập nhật access token
   */
  async updateAccessToken(
    deviceId: string,
    accessToken: string,
    ttl = ACCESS_TOKEN_TTL,
  ): Promise<void> {
    const session = await this.get(deviceId);

    if (!session) {
      return;
    }

    session.accessToken = accessToken;
    session.expiresAt = Date.now() + ttl * 1000;

    await redisService.set(
      RedisKeys.accessToken(deviceId),
      JSON.stringify(session),
      ttl,
    );
  }

  /**
   * Gia hạn TTL
   */
  async refresh(deviceId: string, ttl = ACCESS_TOKEN_TTL): Promise<boolean> {
    return redisService.expire(RedisKeys.accessToken(deviceId), ttl);
  }

  /**
   * Xóa session
   */
  async remove(deviceId: string): Promise<void> {
    await redisService.del(RedisKeys.accessToken(deviceId));
  }

  /**
   * Kiểm tra session tồn tại
   */
  async exists(deviceId: string): Promise<boolean> {
    return redisService.exists(RedisKeys.accessToken(deviceId));
  }

  /**
   * TTL còn lại
   */
  async ttl(deviceId: string): Promise<number> {
    return redisService.ttl(RedisKeys.accessToken(deviceId));
  }
}

export const accessTokenStore = new AccessTokenStore();
