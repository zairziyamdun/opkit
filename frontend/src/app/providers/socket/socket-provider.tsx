import { useEffect, type ReactNode } from 'react'
import { useAuthSession } from '@/entities/user'
import {
  attachSocketDiagnostics,
  connectSocket,
  disconnectSocket,
} from '@/shared/api/socket'
import { useAccessToken } from '@/shared/lib/auth-token'

interface SocketProviderProps {
  readonly children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const accessToken = useAccessToken()
  const { isAuthenticated, isLoading } = useAuthSession()

  useEffect(() => {
    attachSocketDiagnostics()
  }, [])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isAuthenticated && accessToken) {
      connectSocket(accessToken)
      return
    }

    disconnectSocket()
  }, [accessToken, isAuthenticated, isLoading])

  return children
}
