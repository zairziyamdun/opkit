import type { ReactNode } from 'react'
import { useTaskRealtime } from '@/entities/task'
import { useAuthSession } from '@/entities/user'

interface TaskRealtimeProviderProps {
  readonly children: ReactNode
}

export function TaskRealtimeProvider({ children }: TaskRealtimeProviderProps) {
  const { isAuthenticated, isLoading } = useAuthSession()

  useTaskRealtime(isAuthenticated && !isLoading)

  return children
}
