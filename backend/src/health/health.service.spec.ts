import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { HealthService } from './health.service';
import { HealthStatus, ServiceStatus } from './types/health-status.enum';

describe('HealthService', () => {
  let healthService: HealthService;
  let queryRaw: jest.Mock;
  let isHealthy: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn();
    isHealthy = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
        { provide: RedisService, useValue: { isHealthy } },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('возвращает статус ok, когда база данных и Redis доступны', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    isHealthy.mockResolvedValue(true);

    const health = await healthService.check();

    expect(health.status).toBe(HealthStatus.Ok);
    expect(health.database).toBe(ServiceStatus.Up);
    expect(health.redis).toBe(ServiceStatus.Up);
  });

  it('возвращает статус error, когда база данных недоступна', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'));
    isHealthy.mockResolvedValue(true);

    const health = await healthService.check();

    expect(health.status).toBe(HealthStatus.Error);
    expect(health.database).toBe(ServiceStatus.Down);
    expect(health.redis).toBe(ServiceStatus.Up);
  });

  it('возвращает статус error, когда Redis недоступен', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    isHealthy.mockResolvedValue(false);

    const health = await healthService.check();

    expect(health.status).toBe(HealthStatus.Error);
    expect(health.database).toBe(ServiceStatus.Up);
    expect(health.redis).toBe(ServiceStatus.Down);
  });
});
