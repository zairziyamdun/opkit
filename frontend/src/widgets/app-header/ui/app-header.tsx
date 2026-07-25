import { Link } from 'react-router-dom'
import { useAuthSession } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function AppHeader() {
  const { user, isAuthenticated, isLoading, hasToken } = useAuthSession()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
          Opkit
        </Link>
        <nav className="flex items-center gap-2">
          {hasToken && isLoading ? (
            <span className="text-sm text-muted-foreground">Загрузка...</span>
          ) : null}

          {isAuthenticated && user ? (
            <>
              <Link to={ROUTES.tasks}>
                <Button variant="ghost" size="sm">
                  Задачи
                </Button>
              </Link>
              <Link to={ROUTES.profile}>
                <Button variant="ghost" size="sm">
                  Профиль
                </Button>
              </Link>
              <Link
                to={ROUTES.profile}
                className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
              >
                {user.name}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link to={ROUTES.login}>
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to={ROUTES.register}>
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
