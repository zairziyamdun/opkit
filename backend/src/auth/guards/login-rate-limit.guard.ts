import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';
import {
  LOGIN_RATE_LIMIT,
  LOGIN_RATE_WINDOW_SECONDS,
} from '../constants/auth.constants';
import { consumeRedisRateLimit } from '../lib/redis-rate-limit';

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.resolveClientIp(request);

    await consumeRedisRateLimit({
      client: this.redisService.getClient(),
      key: `rate-limit:auth:login:ip:${clientIp}`,
      limit: LOGIN_RATE_LIMIT,
      windowSeconds: LOGIN_RATE_WINDOW_SECONDS,
      message: 'Too many login attempts',
    });

    return true;
  }

  private resolveClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) {
        return first;
      }
    }

    if (Array.isArray(forwarded) && forwarded[0]) {
      return forwarded[0];
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
