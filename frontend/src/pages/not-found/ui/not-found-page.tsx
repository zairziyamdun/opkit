import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-start justify-center gap-4">
      <h1 className="text-3xl font-semibold">Страница не найдена</h1>
      <p className="text-muted-foreground">
        Запрошенный адрес не существует или был перемещён.
      </p>
      <Link to={ROUTES.home}>
        <Button>На главную</Button>
      </Link>
    </section>
  )
}
