import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthStatus, ServiceStatus } from './types/health-status.enum';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    const database = await this.checkDatabase();

    return {
      status:
        database === ServiceStatus.Up ? HealthStatus.Ok : HealthStatus.Error,
      database,
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
}
