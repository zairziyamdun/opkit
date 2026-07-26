import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSocket = {
  auth: {} as Record<string, unknown>,
  connected: false,
  active: false,
  id: 'socket-test',
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  io: {
    on: vi.fn(),
  },
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

vi.mock('@/shared/config/env', () => ({
  env: {
    apiUrl: 'http://localhost:3000/api',
    socketUrl: 'http://localhost:3000',
  },
}))

vi.mock('@/shared/lib/auth-token', () => ({
  getAccessToken: vi.fn(() => null),
}))

describe('socket-client', () => {
  beforeEach(() => {
    vi.resetModules()
    mockSocket.auth = {}
    mockSocket.connected = false
    mockSocket.active = false
    mockSocket.connect.mockClear()
    mockSocket.disconnect.mockClear()
    mockSocket.on.mockClear()
    mockSocket.off.mockClear()
    mockSocket.io.on.mockClear()
  })

  it('не вызывает connect без явного connectSocket', async () => {
    await import('./socket-client')

    expect(mockSocket.connect).not.toHaveBeenCalled()
  })

  it('записывает JWT в socket.auth и вызывает connect', async () => {
    const { connectSocket } = await import('./socket-client')

    connectSocket('access-token-1')

    expect(mockSocket.auth).toEqual({ token: 'access-token-1' })
    expect(mockSocket.connect).toHaveBeenCalledTimes(1)
  })

  it('повторный connectSocket не создаёт второе подключение', async () => {
    const { connectSocket } = await import('./socket-client')

    connectSocket('access-token-1')
    mockSocket.active = true
    connectSocket('access-token-1')

    expect(mockSocket.connect).toHaveBeenCalledTimes(1)
  })

  it('при disconnect очищает socket.auth и вызывает disconnect', async () => {
    const { connectSocket, disconnectSocket } = await import('./socket-client')

    connectSocket('access-token-1')
    mockSocket.connected = true
    disconnectSocket()

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1)
    expect(mockSocket.auth).toEqual({})
  })

  it('ошибка подключения не пробрасывается наружу из diagnostics', async () => {
    const { attachSocketDiagnostics } = await import('./socket-client')

    expect(() => attachSocketDiagnostics()).not.toThrow()
  })
})
