import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { SocketIoRedisAdapterService } from './socket-io-redis-adapter.service';
import { SocketIoAdapter } from './socket-io.adapter';

describe('SocketIoAdapter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('подключает Redis adapter к существующему Socket.IO Server', () => {
    const adapterFactory = jest.fn();
    const serverAdapter = jest.fn();
    const server = {
      adapter: serverAdapter,
    } as unknown as Server;

    jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server);

    const redisAdapterService = {
      getAdapterFactory: jest.fn().mockReturnValue(adapterFactory),
    } as unknown as SocketIoRedisAdapterService;

    const app = {} as INestApplicationContext;
    const adapter = new SocketIoAdapter(
      app,
      'http://localhost:5173',
      redisAdapterService,
    );

    const result = adapter.createIOServer(3000);

    expect(result).toBe(server);
    expect(serverAdapter).toHaveBeenCalledWith(adapterFactory);
  });

  it('оставляет стандартный in-memory adapter, если Redis недоступен', () => {
    const serverAdapter = jest.fn();
    const server = {
      adapter: serverAdapter,
    } as unknown as Server;

    jest.spyOn(IoAdapter.prototype, 'createIOServer').mockReturnValue(server);

    const redisAdapterService = {
      getAdapterFactory: jest.fn().mockReturnValue(null),
    } as unknown as SocketIoRedisAdapterService;

    const adapter = new SocketIoAdapter(
      {} as INestApplicationContext,
      'http://localhost:5173',
      redisAdapterService,
    );

    adapter.createIOServer(3000);

    expect(serverAdapter).not.toHaveBeenCalled();
  });
});
