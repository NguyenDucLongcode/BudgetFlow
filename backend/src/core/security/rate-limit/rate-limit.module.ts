import { Global, Module } from '@nestjs/common';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
})
export class RateLimitModule {}
