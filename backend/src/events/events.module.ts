import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SocketIoRedisAdapterService } from './adapters/socket-io-redis-adapter.service';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [EventsGateway, SocketIoRedisAdapterService],
  exports: [EventsGateway, SocketIoRedisAdapterService],
})
export class EventsModule {}
