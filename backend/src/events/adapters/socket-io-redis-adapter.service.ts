import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { RedisService } from '../../redis/redis.service';

type RedisAdapterFactory = ReturnType<typeof createAdapter>;

@Injectable()
export class SocketIoRedisAdapterService implements OnModuleDestroy {
  private readonly logger = new Logger(SocketIoRedisAdapterService.name);
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private adapterFactory: RedisAdapterFactory | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor(private readonly redisService: RedisService) {}

  initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeClients();
    }

    return this.initializationPromise;
  }

  getAdapterFactory(): RedisAdapterFactory | null {
    return this.adapterFactory;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.closeClient(this.subscriber, 'subscriber'),
      this.closeClient(this.publisher, 'publisher'),
    ]);

    this.subscriber = null;
    this.publisher = null;
    this.adapterFactory = null;
  }

  private async initializeClients(): Promise<void> {
    const baseClient = this.redisService.getClient();

    this.publisher = baseClient.duplicate({
      lazyConnect: true,
      connectTimeout: 3_000,
      retryStrategy: () => null,
    });
    this.subscriber = this.publisher.duplicate();

    this.attachErrorHandler(this.publisher, 'publisher');
    this.attachErrorHandler(this.subscriber, 'subscriber');

    try {
      await Promise.all([this.publisher.connect(), this.subscriber.connect()]);

      this.adapterFactory = createAdapter(this.publisher, this.subscriber);
      this.logger.log('Socket.IO Redis adapter initialized');
    } catch (error) {
      this.logger.error(
        'Socket.IO Redis adapter unavailable; using in-memory adapter',
        error instanceof Error ? error.stack : String(error),
      );

      await Promise.all([
        this.closeClient(this.subscriber, 'subscriber'),
        this.closeClient(this.publisher, 'publisher'),
      ]);

      this.subscriber = null;
      this.publisher = null;
      this.adapterFactory = null;
    }
  }

  private attachErrorHandler(client: Redis, role: string): void {
    client.on('error', (error: Error) => {
      this.logger.error(
        `Socket.IO Redis ${role} error: ${error.message}`,
        error.stack,
      );
    });
  }

  private async closeClient(client: Redis | null, role: string): Promise<void> {
    if (!client || client.status === 'end') {
      return;
    }

    try {
      if (client.status === 'ready' || client.status === 'connect') {
        await client.quit();
      } else {
        client.disconnect();
      }

      this.logger.log(`Socket.IO Redis ${role} closed`);
    } catch (error) {
      this.logger.warn(
        `Failed to close Socket.IO Redis ${role} gracefully`,
        error instanceof Error ? error.message : String(error),
      );
      client.disconnect();
    }
  }
}
