import { Link } from 'react-router-dom'
import { useAuthSession } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { Alert, Button } from '@/shared/ui'

export function HomeHero() {
  const { isAuthenticated, user } = useAuthSession()

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-h1 font-bold tracking-tight text-foreground">
          Opkit
        </h1>
        <p className="max-w-xl text-body text-muted-foreground">
          {isAuthenticated && user
            ? `С возвращением, ${user.name}. Управляйте задачами в одном месте.`
            : 'Mini CRM для управления задачами. Войдите или создайте аккаунт, чтобы начать.'}
        </p>
      </div>

      {isAuthenticated ? (
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.tasks}>
            <Button>Перейти к задачам</Button>
          </Link>
          <Link to={ROUTES.profile}>
            <Button variant="outline">Профиль</Button>
          </Link>
        </div>
      ) : (
        <>
          <Alert>
            Для доступа к задачам нужна авторизация. JWT хранится локально и
            проверяется через /auth/me.
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.login}>
              <Button>Войти</Button>
            </Link>
            <Link to={ROUTES.register}>
              <Button variant="outline">Регистрация</Button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
