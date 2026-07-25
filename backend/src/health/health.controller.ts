import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';
import { HealthStatus } from './types/health-status.enum';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Состояние приложения и его зависимостей' })
  @ApiOkResponse({ type: HealthResponseDto })
  async check(): Promise<HealthResponseDto> {
    const health = await this.healthService.check();

    if (health.status !== HealthStatus.Ok) {
      throw new ServiceUnavailableException(health);
    }

    return health;
  }
}
