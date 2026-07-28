import type { ReactNode } from 'react'
import { AuthBootstrapProvider } from '@/app/providers/auth-bootstrap-provider'
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
      <AuthBootstrapProvider>
        <RouterProvider>
          <SocketProvider>
            <TaskRealtimeProvider>
              {children}
              <Toaster />
            </TaskRealtimeProvider>
          </SocketProvider>
        </RouterProvider>
      </AuthBootstrapProvider>
    </QueryProvider>
  )
}
