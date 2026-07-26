import { RedisService } from './redis.service';

describe('RedisService', () => {
  it('не останавливает запуск приложения, если Redis недоступен', async () => {
    const service = Object.create(RedisService.prototype) as RedisService;
    const connect = jest
      .fn()
      .mockRejectedValue(new Error('connection refused'));
    const loggerError = jest.fn();

    Object.defineProperties(service, {
      client: {
        value: { connect },
      },
      logger: {
        value: { error: loggerError },
      },
    });

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(connect).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenCalled();
  });
});
