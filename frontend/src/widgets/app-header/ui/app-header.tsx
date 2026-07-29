import { Link } from 'react-router-dom'
import { getUserInitials, useAuthSession } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function AppHeader() {
  const { user, isAuthenticated, isLoading, hasToken } = useAuthSession()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex min-h-14 w-full max-w-[1440px] items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link
          to={ROUTES.home}
          className="shrink-0 text-h3 font-semibold tracking-tight text-foreground"
        >
          Opkit
        </Link>
        <nav className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {hasToken && isLoading ? (
            <span className="text-small text-muted-foreground">Загрузка...</span>
          ) : null}

          {isAuthenticated && user ? (
            <>
              <Link to={ROUTES.tasks}>
                <Button variant="ghost" className="h-10 px-3 sm:h-8 sm:px-3">
                  Задачи
                </Button>
              </Link>
              <Link
                to={ROUTES.profile}
                className="inline-flex h-10 items-center gap-2 rounded-button px-2 text-small font-medium text-foreground-body transition-colors hover:bg-muted sm:h-8"
                title="Профиль"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground sm:size-6"
                  aria-hidden
                >
                  {getUserInitials(user.name)}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.name}
                </span>
              </Link>
              <LogoutButton className="h-10 sm:h-8" />
            </>
          ) : (
            <>
              <Link to={ROUTES.login}>
                <Button variant="ghost" className="h-10 px-3 sm:h-8 sm:px-3">
                  Войти
                </Button>
              </Link>
              <Link to={ROUTES.register}>
                <Button className="h-10 px-3 sm:h-8 sm:px-3">Регистрация</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
