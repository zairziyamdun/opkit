import { RedisService } from '../../redis/redis.service';
import { SocketIoRedisAdapterService } from './socket-io-redis-adapter.service';

interface RedisMock {
  status: string;
  readonly connect: jest.Mock;
  readonly quit: jest.Mock;
  readonly disconnect: jest.Mock;
  readonly duplicate: jest.Mock;
  readonly on: jest.Mock;
}

function createRedisMock(status = 'wait'): RedisMock {
  return {
    status,
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
    duplicate: jest.fn(),
    on: jest.fn(),
  };
}

describe('SocketIoRedisAdapterService', () => {
  let baseClient: RedisMock;
  let publisher: RedisMock;
  let subscriber: RedisMock;
  let service: SocketIoRedisAdapterService;

  beforeEach(() => {
    baseClient = createRedisMock('ready');
    publisher = createRedisMock('ready');
    subscriber = createRedisMock('ready');

    baseClient.duplicate.mockReturnValue(publisher);
    publisher.duplicate.mockReturnValue(subscriber);

    const redisService = {
      getClient: jest.fn().mockReturnValue(baseClient),
    } as unknown as RedisService;

    service = new SocketIoRedisAdapterService(redisService);
  });

  it('создаёт publisher один раз и subscriber через publisher.duplicate()', async () => {
    await service.initialize();
    await service.initialize();

    expect(baseClient.duplicate).toHaveBeenCalledTimes(1);
    expect(publisher.duplicate).toHaveBeenCalledTimes(1);
    expect(publisher.connect).toHaveBeenCalledTimes(1);
    expect(subscriber.connect).toHaveBeenCalledTimes(1);
    expect(service.getAdapterFactory()).not.toBeNull();
  });

  it('подключает обработчики ошибок к обоим клиентам', async () => {
    await service.initialize();

    expect(publisher.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(subscriber.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('graceful shutdown закрывает subscriber и publisher', async () => {
    await service.initialize();
    await service.onModuleDestroy();

    expect(subscriber.quit).toHaveBeenCalledTimes(1);
    expect(publisher.quit).toHaveBeenCalledTimes(1);
    expect(service.getAdapterFactory()).toBeNull();
  });

  it('при недоступном Redis не бросает ошибку и оставляет in-memory adapter', async () => {
    publisher.status = 'wait';
    subscriber.status = 'wait';
    publisher.connect.mockRejectedValue(new Error('connection refused'));

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(service.getAdapterFactory()).toBeNull();
    expect(publisher.disconnect).toHaveBeenCalled();
    expect(subscriber.disconnect).toHaveBeenCalled();
  });
});
