import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';
import { UserEntity } from '../../users/entities/user.entity';
import {
  VERIFY_PASSWORD_RATE_LIMIT,
  VERIFY_PASSWORD_RATE_WINDOW_SECONDS,
} from '../constants/auth.constants';
import { consumeRedisRateLimit } from '../lib/redis-rate-limit';

interface AuthenticatedRequest extends Request {
  user?: UserEntity;
}

@Injectable()
export class VerifyPasswordRateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await consumeRedisRateLimit({
      client: this.redisService.getClient(),
      key: `rate-limit:auth:verify-password:${userId}`,
      limit: VERIFY_PASSWORD_RATE_LIMIT,
      windowSeconds: VERIFY_PASSWORD_RATE_WINDOW_SECONDS,
      message: 'Too many password verification attempts',
    });

    return true;
  }
}
