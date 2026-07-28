import { motion } from 'framer-motion'
import { Columns3, Radio, Search } from 'lucide-react'

const FEATURES = [
  {
    icon: Columns3,
    title: 'Kanban без хаоса',
    description:
      'Три колонки статусов, drag-and-drop и порядок карточек — весь поток задач на одной доске.',
  },
  {
    icon: Radio,
    title: 'Синхронизация в реальном времени',
    description:
      'Создали, изменили или удалили задачу — обновление приходит во все вкладки через Socket.IO.',
  },
  {
    icon: Search,
    title: 'Поиск и фильтры',
    description:
      'Находите задачи по названию, фильтруйте по статусу и приоритету, сортируйте как удобно.',
  },
] as const

export function HomeFeatures() {
  return (
    <section className="border-t border-border py-10 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-h2 font-semibold tracking-tight text-foreground">
          Всё для ежедневной работы с задачами
        </h2>
        <p className="mt-3 text-small text-muted-foreground sm:text-body">
          OpKit собирает доску, статусы и live-обновления в одном спокойном интерфейсе.
        </p>
      </div>

      <div className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-3 sm:gap-8">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="text-center sm:text-left"
            >
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-0">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-h3 font-semibold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
