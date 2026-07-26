import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketIoRedisAdapterService } from './socket-io-redis-adapter.service';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly corsOrigin: string,
    private readonly redisAdapterService: SocketIoRedisAdapterService,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.corsOrigin,
        credentials: true,
      },
    }) as Server;

    const redisAdapterFactory = this.redisAdapterService.getAdapterFactory();

    if (redisAdapterFactory) {
      server.adapter(redisAdapterFactory);
    }

    return server;
  }
}
