import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  // Method to get the Redis client instance
  getClient() {
    return this.client;
  }

  // Method to close the Redis connection when the module is destroyed
  async onModuleDestroy() {
    await this.client.quit();
  }
}
