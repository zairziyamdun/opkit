import { ApiProperty } from '@nestjs/swagger';
import { HealthStatus, ServiceStatus } from '../types/health-status.enum';

export class HealthResponseDto {
  @ApiProperty({ enum: HealthStatus, example: HealthStatus.Ok })
  readonly status: HealthStatus;

  @ApiProperty({ enum: ServiceStatus, example: ServiceStatus.Up })
  readonly database: ServiceStatus;

  @ApiProperty({ enum: ServiceStatus, example: ServiceStatus.Up })
  readonly redis: ServiceStatus;

  @ApiProperty({ description: 'Время работы процесса в секундах', example: 42 })
  readonly uptime: number;

  @ApiProperty({ example: '2026-07-25T12:00:00.000Z' })
  readonly timestamp: string;
}
