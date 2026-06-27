import { Injectable } from '@nestjs/common';
import { RedisService } from './modules/redis/redis.service';

@Injectable()
export class AppService {
  constructor(private redisService: RedisService) {}
  async getHello() {
    const redis = this.redisService.getClient();

    await redis.set('test-key', 'hello redis');
    const value = await redis.get('test-key');

    console.log(value); // hello redis

    return 'Hello World!';
  }
}
