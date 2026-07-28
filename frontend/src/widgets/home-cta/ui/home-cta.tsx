import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthSession } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui'

export function HomeCta() {
  const { isAuthenticated } = useAuthSession()

  return (
    <section className="border-t border-border py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-foreground px-5 py-10 text-center sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(99_102_241_/_0.35),transparent_50%)]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-h2 font-semibold tracking-tight text-primary-foreground">
            {isAuthenticated
              ? 'Доска уже ждёт вас'
              : 'Начните вести задачи за минуту'}
          </h2>
          <p className="mt-3 text-small text-primary-foreground/75 sm:text-body">
            {isAuthenticated
              ? 'Вернитесь к Kanban и продолжите с того места, где остановились.'
              : 'Создайте аккаунт, добавьте первую задачу и следите за прогрессом в реальном времени.'}
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            {isAuthenticated ? (
              <Link to={ROUTES.tasks} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-card text-foreground hover:bg-muted sm:w-auto"
                >
                  Открыть задачи
                </Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.register} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-card text-foreground hover:bg-muted sm:w-auto"
                  >
                    Создать аккаунт
                  </Button>
                </Link>
                <Link to={ROUTES.login} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  >
                    Уже есть аккаунт
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
