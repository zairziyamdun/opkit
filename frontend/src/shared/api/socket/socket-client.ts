import { io, type Socket } from 'socket.io-client'
import { env } from '@/shared/config/env'
import { getAccessToken } from '@/shared/lib/auth-token'
import type { SocketAuth } from './socket.types'

function createSocketClient(): Socket {
  return io(env.socketUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    transports: ['websocket', 'polling'],
  })
}

export const socket: Socket = createSocketClient()

let diagnosticsAttached = false

function setSocketAuth(token: string | null): void {
  const auth: SocketAuth = token ? { token } : {}
  socket.auth = auth
}

function refreshAuthFromStore(): boolean {
  const token = getAccessToken()

  if (!token) {
    setSocketAuth(null)
    return false
  }

  setSocketAuth(token)
  return true
}

export function attachSocketDiagnostics(): void {
  if (diagnosticsAttached || !import.meta.env.DEV) {
    return
  }

  diagnosticsAttached = true

  socket.on('connect', () => {
    console.info('[socket] connected', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.info('[socket] disconnected', reason)
  })

  socket.on('connect_error', (error) => {
    console.info('[socket] connect_error', error.message)
  })

  socket.io.on('reconnect_attempt', (attempt) => {
    console.info('[socket] reconnect_attempt', attempt)

    if (!refreshAuthFromStore()) {
      socket.disconnect()
    }
  })
}

export function connectSocket(accessToken: string): void {
  setSocketAuth(accessToken)

  if (socket.connected || socket.active) {
    return
  }

  socket.connect()
}

export function disconnectSocket(): void {
  if (socket.connected || socket.active) {
    socket.disconnect()
  }

  setSocketAuth(null)
}
