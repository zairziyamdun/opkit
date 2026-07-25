import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';
import { HealthStatus, ServiceStatus } from './types/health-status.enum';

describe('HealthService', () => {
  let healthService: HealthService;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('возвращает статус ok, когда база данных доступна', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const health = await healthService.check();

    expect(health.status).toBe(HealthStatus.Ok);
    expect(health.database).toBe(ServiceStatus.Up);
  });

  it('возвращает статус error, когда база данных недоступна', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'));

    const health = await healthService.check();

    expect(health.status).toBe(HealthStatus.Error);
    expect(health.database).toBe(ServiceStatus.Down);
  });
});
