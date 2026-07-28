import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthSession } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

const MOCK_COLUMNS = [
  {
    title: 'К выполнению',
    count: 2,
    tasks: [
      { title: 'Собрать бриф', priority: 'Высокий', tone: 'text-priority-high' },
      { title: 'Настроить доступы', priority: 'Средний', tone: 'text-priority-medium' },
    ],
  },
  {
    title: 'В работе',
    count: 1,
    tasks: [
      { title: 'Канбан и фильтры', priority: 'Высокий', tone: 'text-priority-high' },
    ],
  },
  {
    title: 'Выполнено',
    count: 1,
    tasks: [
      { title: 'Авторизация', priority: 'Низкий', tone: 'text-priority-low' },
    ],
  },
] as const

function BoardPreview() {
  return (
    <div
      aria-hidden
      className="relative mt-10 overflow-hidden rounded-2xl border border-border/80 bg-muted/60 p-3 shadow-card-hover sm:p-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(99_102_241_/_0.12),transparent_55%)]" />
      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MOCK_COLUMNS.map((column, columnIndex) => (
          <motion.div
            key={column.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + columnIndex * 0.08, duration: 0.4 }}
            className="min-h-40 rounded-xl border border-border/70 bg-card p-2.5"
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-caption font-semibold text-foreground">
                {column.title}
              </span>
              <span className="rounded-full bg-muted px-1.5 text-caption font-semibold text-muted-foreground tabular-nums">
                {column.count}
              </span>
            </div>
            <div className="space-y-2">
              {column.tasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-lg border border-border bg-card px-2.5 py-2 shadow-sm"
                >
                  <p className="text-caption font-semibold text-foreground">
                    {task.title}
                  </p>
                  <p className={`mt-1 text-caption ${task.tone}`}>{task.priority}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function HomeHero() {
  const { isAuthenticated, user } = useAuthSession()

  return (
    <section className="relative overflow-hidden pb-4">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(ellipse_at_center,rgb(79_70_229_/_0.14),transparent_65%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative mx-auto max-w-3xl pt-6 text-center sm:pt-10"
      >
        <p className="text-[clamp(2.75rem,8vw,4.5rem)] leading-none font-bold tracking-tight text-foreground">
          OpKit
        </p>
        <h1 className="mt-4 text-h2 font-semibold tracking-tight text-foreground sm:text-h1">
          {isAuthenticated && user
            ? `С возвращением, ${user.name}`
            : 'Задачи под контролем — в реальном времени'}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
          {isAuthenticated
            ? 'Откройте доску и продолжите работу с задачами без потери контекста.'
            : 'Mini CRM с Kanban, фильтрами и мгновенной синхронизацией между вкладками.'}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.tasks}>
                <Button size="lg">Перейти к задачам</Button>
              </Link>
              <Link to={ROUTES.profile}>
                <Button size="lg" variant="outline">
                  Профиль
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={ROUTES.register}>
                <Button size="lg">Начать бесплатно</Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button size="lg" variant="outline">
                  Войти
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <BoardPreview />
    </section>
  )
}
