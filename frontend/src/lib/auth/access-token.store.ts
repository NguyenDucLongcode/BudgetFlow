import { redisService } from "../redis/ redis.service";
import { ACCESS_TOKEN_TTL } from "./auth.constants";
import type { AccessTokenSession } from "./auth.types";
import { RedisKeys } from "@/lib/redis/redis.keys";

export class AccessTokenStore {
  /**
   * Lưu access token
   */
  async save(
    sessionId: string,
    payload: AccessTokenSession,
    ttl = ACCESS_TOKEN_TTL,
  ): Promise<void> {
    await redisService.set(
      RedisKeys.accessToken(sessionId),
      JSON.stringify(payload),
      ttl,
    );
  }

  async updateAccessToken(
    sessionId: string,
    accessToken: string,
  ): Promise<void> {
    const session = await this.get(sessionId);

    if (!session) {
      return;
    }

    await this.save(sessionId, {
      ...session,
      accessToken,
    });
  }

  /**
   * Lấy access token
   */
  async get(sessionId: string): Promise<AccessTokenSession | null> {
    const data = await redisService.get(RedisKeys.accessToken(sessionId));

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
   * Chỉ lấy JWT
   */
  async getAccessToken(sessionId: string): Promise<string | null> {
    const session = await this.get(sessionId);

    return session?.accessToken ?? null;
  }

  /**
   * Gia hạn TTL
   */
  async refresh(sessionId: string, ttl = ACCESS_TOKEN_TTL): Promise<boolean> {
    return redisService.expire(RedisKeys.accessToken(sessionId), ttl);
  }

  /**
   * Xóa session
   */
  async remove(sessionId: string): Promise<void> {
    await redisService.del(RedisKeys.accessToken(sessionId));
  }

  /**
   * Kiểm tra tồn tại
   */
  async exists(sessionId: string): Promise<boolean> {
    return redisService.exists(RedisKeys.accessToken(sessionId));
  }

  /**
   * TTL còn lại
   */
  async ttl(sessionId: string): Promise<number> {
    return redisService.ttl(RedisKeys.accessToken(sessionId));
  }
}

export const accessTokenStore = new AccessTokenStore();
