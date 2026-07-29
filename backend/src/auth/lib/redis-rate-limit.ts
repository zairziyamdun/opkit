import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import type Redis from 'ioredis';

const logger = new Logger('RedisRateLimit');

export async function consumeRedisRateLimit(options: {
  readonly client: Redis;
  readonly key: string;
  readonly limit: number;
  readonly windowSeconds: number;
  readonly message: string;
}): Promise<void> {
  if (options.client.status !== 'ready') {
    return;
  }

  try {
    const count = await options.client.incr(options.key);

    if (count === 1) {
      await options.client.expire(options.key, options.windowSeconds);
    }

    if (count > options.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: options.message,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    logger.warn(
      `Rate limit skipped for ${options.key}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
