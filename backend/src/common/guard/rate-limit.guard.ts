import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-rate-limit.decorator';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    /**
     * Skip rate limit
     */
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip) {
      return true;
    }

    /**
     * Endpoint custom limit
     */
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? {
      ttl: 60,
      limit: 100,
    };

    const key = this.generateKey(request);

    /**
     * Counter
     */
    const current = await this.redisService.incr(key);

    /**
     * TTL
     */
    let ttl = await this.redisService.ttl(key);

    if (ttl === -1) {
      await this.redisService.expire(key, options.ttl);
      ttl = options.ttl;
    }

    if (ttl < 0) {
      await this.redisService.expire(key, options.ttl);
      ttl = options.ttl;
    }

    /**
     * Headers
     */
    response.setHeader('X-RateLimit-Limit', options.limit);

    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, options.limit - current),
    );

    response.setHeader(
      'X-RateLimit-Reset',
      Math.floor(Date.now() / 1000) + ttl,
    );

    /**
     * Exceeded
     */
    if (current > options.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Redis Key
   *
   * rate_limit:user:uuid:POST:/auth/login
   *
   * rate_limit:ip:127.0.0.1:GET:/users/me
   */
  private generateKey(request: Request): string {
    const method = request.method;

    const path = request.baseUrl + (request.route?.path ?? request.path);

    const user = request.user;

    // Get the IP address from the request headers or fallback to request.ip
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      request.ip;

    if (user?.sub) {
      return `rate_limit:ip:${ip}:${method}:${path}:user:${user.sub}`;
    }

    return `rate_limit:ip:${ip}:${method}:${path}:user:${user?.sub}:`;
  }
}
