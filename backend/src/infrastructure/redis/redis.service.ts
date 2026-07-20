import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private readonly client: Redis;

  constructor() {
    const options: RedisOptions = {
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,

      // Production thường chỉ dùng DB0
      db: Number(process.env.REDIS_DB ?? 0),

      // Prefix chung cho toàn project
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'budgetflow:',

      // Kết nối timeout 10s
      connectTimeout: 10_000,

      enableReadyCheck: true,

      // Chỉ kết nối khi cần
      lazyConnect: true,

      // Không throw MaxRetriesPerRequestError
      maxRetriesPerRequest: null,

      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);

        this.logger.warn(
          `Redis reconnect attempt #${times}. Retry in ${delay} ms`,
        );

        return delay;
      },
    };

    this.client = new Redis(options);

    this.registerEvents();
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  /**
   * Redis client
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * SET
   */
  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }

    return this.client.set(key, value);
  }

  /**
   * GET
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * DELETE
   */
  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  /**
   * EXISTS
   */
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  /**
   * TTL
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * EXPIRE
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    return (await this.client.expire(key, seconds)) === 1;
  }

  /**
   * INCREMENT
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * DECREMENT
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * PING
   */
  async ping(): Promise<string> {
    return this.client.ping();
  }

  /**
   * Health Check
   */
  async healthCheck() {
    const start = Date.now();

    await this.client.ping();

    return {
      status: 'ok',
      latency: Date.now() - start,
    };
  }

  private registerEvents() {
    this.client.on('connect', () => {
      this.logger.log('Connecting to Redis...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis is ready.');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Reconnecting to Redis...');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed.');
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection ended.');
    });

    this.client.on('error', (error) => {
      this.logger.error(error.message);
    });
  }
}
