import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.getOrThrow<string>('REDIS_URL');

    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      retryStrategy: (times: number): number | null => {
        if (times > 10) {
          this.logger.error('Redis reconnect attempts exceeded');
          return null;
        }

        return Math.min(times * 200, 2_000);
      },
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis client error: ${error.message}`, error.stack);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis TCP connection established');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error(
        'Failed to connect to Redis; continuing without Redis-dependent features',
        error,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.client.status === 'end') {
        return;
      }

      await this.client.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.warn(
        'Graceful Redis quit failed, forcing disconnect',
        error instanceof Error ? error.message : String(error),
      );
      this.client.disconnect();
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping failed', error);
      return false;
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.ping();
  }
}
