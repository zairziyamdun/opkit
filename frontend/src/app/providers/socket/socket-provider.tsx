import { useEffect, type ReactNode } from 'react'
import type { TaskCreatedPayload, TaskUpdatedPayload } from '@/entities/task'
import { useAuthSession } from '@/entities/user'
import {
  TASK_SOCKET_EVENTS,
  attachSocketDiagnostics,
  connectSocket,
  disconnectSocket,
  useSocketEvent,
  type TaskDeletedPayload,
  type TaskStatusChangedPayload,
} from '@/shared/api/socket'
import { useAccessToken } from '@/shared/lib/auth-token'

function useDevTaskSocketLogger(enabled: boolean): void {
  useSocketEvent<TaskCreatedPayload>(
    TASK_SOCKET_EVENTS.CREATED,
    (payload) => {
      if (import.meta.env.DEV) {
        console.info('[socket] event', TASK_SOCKET_EVENTS.CREATED, payload.id)
      }
    },
    enabled,
  )

  useSocketEvent<TaskUpdatedPayload>(
    TASK_SOCKET_EVENTS.UPDATED,
    (payload) => {
      if (import.meta.env.DEV) {
        console.info('[socket] event', TASK_SOCKET_EVENTS.UPDATED, payload.id)
      }
    },
    enabled,
  )

  useSocketEvent<TaskDeletedPayload>(
    TASK_SOCKET_EVENTS.DELETED,
    (payload) => {
      if (import.meta.env.DEV) {
        console.info('[socket] event', TASK_SOCKET_EVENTS.DELETED, payload.id)
      }
    },
    enabled,
  )

  useSocketEvent<TaskStatusChangedPayload>(
    TASK_SOCKET_EVENTS.STATUS_CHANGED,
    (payload) => {
      if (import.meta.env.DEV) {
        console.info(
          '[socket] event',
          TASK_SOCKET_EVENTS.STATUS_CHANGED,
          payload.id,
          payload.status,
        )
      }
    },
    enabled,
  )
}

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

  useDevTaskSocketLogger(isAuthenticated && !isLoading)

  return children
}
