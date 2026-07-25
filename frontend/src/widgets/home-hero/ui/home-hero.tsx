import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { Alert, Button } from '@/shared/ui'

export function HomeHero() {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Opkit
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Mini CRM для управления задачами. Frontend Sprint 1: маршрутизация,
          TanStack Query, Axios и базовый UI готовы к следующим фичам.
        </p>
      </div>

      <Alert>
        Backend API: авторизация и задачи уже доступны. Следующий шаг —
        страницы Login / Register и список задач.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.login}>
          <Button>Перейти ко входу</Button>
        </Link>
        <Link to={ROUTES.tasks}>
          <Button variant="outline">Задачи</Button>
        </Link>
      </div>
    </section>
  )
}
