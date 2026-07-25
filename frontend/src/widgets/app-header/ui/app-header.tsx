import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
          Opkit
        </Link>
        <nav className="flex items-center gap-2">
          <Link to={ROUTES.login}>
            <Button variant="ghost" size="sm">
              Войти
            </Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button size="sm">Регистрация</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
