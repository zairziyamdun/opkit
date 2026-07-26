import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { extractAccessToken } from './lib/extract-access-token';
import { getUserRoomName } from './lib/user-room';
import { AuthenticatedSocket } from './types/socket-session-data.interface';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const userId = await this.authenticate(client);

    if (!userId) {
      this.logger.warn(`Unauthorized socket connection rejected: ${client.id}`);
      client.disconnect(true);
      return;
    }

    client.data = { userId };
    await client.join(getUserRoomName(userId));

    this.logger.log(`Socket ${client.id} connected for user ${userId}`);
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data.userId;

    if (userId) {
      this.logger.log(`Socket ${client.id} disconnected for user ${userId}`);
    }
  }

  emitToUser<TPayload>(userId: string, event: string, payload: TPayload): void {
    this.server.to(getUserRoomName(userId)).emit(event, payload);
  }

  private async authenticate(
    client: AuthenticatedSocket,
  ): Promise<string | null> {
    const token = extractAccessToken(client);

    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.usersService.findById(payload.sub);

      return user ? user.id : null;
    } catch {
      return null;
    }
  }
}
