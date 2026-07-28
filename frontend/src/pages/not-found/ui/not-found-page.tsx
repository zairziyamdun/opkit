import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-10 text-center sm:items-start sm:px-0 sm:text-left">
      <h1 className="text-h2 font-semibold tracking-tight text-foreground sm:text-3xl">
        Страница не найдена
      </h1>
      <p className="max-w-md text-small text-muted-foreground sm:text-body">
        Запрошенный адрес не существует или был перемещён.
      </p>
      <Link to={ROUTES.home} className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto">На главную</Button>
      </Link>
    </section>
  )
}
