import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { PageLoader } from '@/shared/ui'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading, hasToken } = useAuthSession()

  if (hasToken && isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
