import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { EventsGateway } from './events.gateway';
import { AuthenticatedSocket } from './types/socket-session-data.interface';

interface MockSocketOptions {
  readonly token?: string;
  readonly authorizationHeader?: string;
}

function createMockSocket(options: MockSocketOptions = {}) {
  const join = jest.fn().mockResolvedValue(undefined);
  const disconnect = jest.fn();

  const socket = {
    id: 'socket-1',
    handshake: {
      auth: options.token ? { token: options.token } : {},
      headers: options.authorizationHeader
        ? { authorization: options.authorizationHeader }
        : {},
    },
    data: {},
    join,
    disconnect,
  } as unknown as AuthenticatedSocket;

  return { socket, join, disconnect };
}

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let verifyAsync: jest.Mock;
  let findById: jest.Mock;

  beforeEach(async () => {
    verifyAsync = jest.fn();
    findById = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        { provide: JwtService, useValue: { verifyAsync } },
        { provide: UsersService, useValue: { findById } },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('подключает клиента с валидным токеном и добавляет в комнату user:{userId}', async () => {
    verifyAsync.mockResolvedValue({ sub: 'user-1', email: 'user@test.dev' });
    findById.mockResolvedValue({ id: 'user-1' });

    const { socket, join, disconnect } = createMockSocket({ token: 'valid' });

    await gateway.handleConnection(socket);

    expect(join).toHaveBeenCalledWith('user:user-1');
    expect(socket.data.userId).toBe('user-1');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('извлекает токен из заголовка Authorization', async () => {
    verifyAsync.mockResolvedValue({ sub: 'user-1', email: 'user@test.dev' });
    findById.mockResolvedValue({ id: 'user-1' });

    const { socket, join } = createMockSocket({
      authorizationHeader: 'Bearer header-token',
    });

    await gateway.handleConnection(socket);

    expect(verifyAsync).toHaveBeenCalledWith('header-token');
    expect(join).toHaveBeenCalledWith('user:user-1');
  });

  it('отключает клиента без токена', async () => {
    const { socket, join, disconnect } = createMockSocket();

    await gateway.handleConnection(socket);

    expect(disconnect).toHaveBeenCalledWith(true);
    expect(join).not.toHaveBeenCalled();
  });

  it('отключает клиента с невалидным токеном', async () => {
    verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const { socket, join, disconnect } = createMockSocket({ token: 'expired' });

    await gateway.handleConnection(socket);

    expect(disconnect).toHaveBeenCalledWith(true);
    expect(join).not.toHaveBeenCalled();
  });

  it('отключает клиента, если пользователь не найден', async () => {
    verifyAsync.mockResolvedValue({ sub: 'ghost', email: 'ghost@test.dev' });
    findById.mockResolvedValue(null);

    const { socket, join, disconnect } = createMockSocket({ token: 'valid' });

    await gateway.handleConnection(socket);

    expect(disconnect).toHaveBeenCalledWith(true);
    expect(join).not.toHaveBeenCalled();
  });
});
