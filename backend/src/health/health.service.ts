import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthStatus, ServiceStatus } from './types/health-status.enum';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const isHealthy =
      database === ServiceStatus.Up && redis === ServiceStatus.Up;

    return {
      status: isHealthy ? HealthStatus.Ok : HealthStatus.Error,
      database,
      redis,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return ServiceStatus.Up;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return ServiceStatus.Down;
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    try {
      const isHealthy = await this.redisService.isHealthy();
      return isHealthy ? ServiceStatus.Up : ServiceStatus.Down;
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return ServiceStatus.Down;
    }
  }
}
