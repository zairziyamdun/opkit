import { useEffect, useState, type ReactNode } from 'react'
import { refreshSessionRequest } from '@/shared/api/api-client'
import { getAccessToken } from '@/shared/lib/auth-token'
import { PageLoader } from '@/shared/ui'

interface AuthBootstrapProviderProps {
  readonly children: ReactNode
}

export function AuthBootstrapProvider({
  children,
}: AuthBootstrapProviderProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap(): Promise<void> {
      if (!getAccessToken()) {
        try {
          await refreshSessionRequest()
        } catch {
          // Нет валидной refresh-сессии — остаёмся гостем.
        }
      }

      if (!cancelled) {
        setIsReady(true)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  if (!isReady) {
    return <PageLoader />
  }

  return children
}
