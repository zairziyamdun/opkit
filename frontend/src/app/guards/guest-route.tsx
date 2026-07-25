import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { PageLoader } from '@/shared/ui'

export function GuestRoute() {
  const { isAuthenticated, isLoading, hasToken } = useAuthSession()

  if (hasToken && isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.tasks} replace />
  }

  return <Outlet />
}
