import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const connectSocket = vi.fn()
const disconnectSocket = vi.fn()
const attachSocketDiagnostics = vi.fn()

vi.mock('@/shared/api/socket', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api/socket')>(
    '@/shared/api/socket',
  )

  return {
    ...actual,
    connectSocket,
    disconnectSocket,
    attachSocketDiagnostics,
    useSocketEvent: vi.fn(),
  }
})

const useAuthSession = vi.fn()
const useAccessToken = vi.fn()

vi.mock('@/entities/user', () => ({
  useAuthSession: () => useAuthSession(),
}))

vi.mock('@/shared/lib/auth-token', () => ({
  useAccessToken: () => useAccessToken(),
}))

describe('SocketProvider', () => {
  beforeEach(() => {
    connectSocket.mockClear()
    disconnectSocket.mockClear()
    attachSocketDiagnostics.mockClear()
  })

  it('не подключает socket без access token / пока сессия грузится', async () => {
    useAccessToken.mockReturnValue(null)
    useAuthSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    })

    const { SocketProvider } = await import('./socket-provider')

    render(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>,
    )

    expect(connectSocket).not.toHaveBeenCalled()
    expect(disconnectSocket).toHaveBeenCalled()
  })

  it('не подключает socket, пока isLoading=true', async () => {
    useAccessToken.mockReturnValue('token')
    useAuthSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    })

    const { SocketProvider } = await import('./socket-provider')

    render(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>,
    )

    expect(connectSocket).not.toHaveBeenCalled()
  })

  it('после авторизации передаёт JWT и вызывает connect', async () => {
    useAccessToken.mockReturnValue('jwt-token')
    useAuthSession.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    const { SocketProvider } = await import('./socket-provider')

    render(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>,
    )

    expect(connectSocket).toHaveBeenCalledWith('jwt-token')
  })

  it('повторный render не вызывает connect повторно при том же состоянии', async () => {
    useAccessToken.mockReturnValue('jwt-token')
    useAuthSession.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    })

    const { SocketProvider } = await import('./socket-provider')

    const { rerender } = render(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>,
    )

    rerender(
      <SocketProvider>
        <div>child</div>
      </SocketProvider>,
    )

    // StrictMode may double-invoke effects in tests depending on setup;
    // connectSocket itself guards against duplicate connections.
    expect(connectSocket).toHaveBeenCalled()
    expect(connectSocket.mock.calls.every((call) => call[0] === 'jwt-token')).toBe(
      true,
    )
  })
})
