import type { ReactNode } from 'react'
import { QueryProvider } from '@/app/providers/query-provider'
import { RouterProvider } from '@/app/providers/router-provider'
import { SocketProvider } from '@/app/providers/socket'
import { TaskRealtimeProvider } from '@/app/providers/task-realtime'
import { Toaster } from '@/shared/ui'

interface AppProvidersProps {
  readonly children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <RouterProvider>
        <SocketProvider>
          <TaskRealtimeProvider>
            {children}
            <Toaster />
          </TaskRealtimeProvider>
        </SocketProvider>
      </RouterProvider>
    </QueryProvider>
  )
}
