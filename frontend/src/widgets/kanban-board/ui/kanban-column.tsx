import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import type { Task, TaskStatus } from '@/entities/task'
import { cn } from '@/shared/lib/cn'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  readonly status: TaskStatus
  readonly tasks: readonly Task[]
  readonly activeDragTaskId?: string | null
  readonly onTaskDeleted?: () => void
}

const cardTransition: Transition = {
  type: 'spring',
  stiffness: 550,
  damping: 34,
  mass: 0.7,
}

export function KanbanColumn({
  status,
  tasks,
  activeDragTaskId = null,
  onTaskDeleted,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-72 min-w-0 flex-1 flex-col rounded-lg border border-border bg-muted/40 transition-all duration-200 ease-out',
        isOver &&
          'border-primary/40 bg-primary/5 shadow-md ring-2 ring-primary/15',
      )}
    >
      <header className="border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {status}{' '}
          <motion.span
            key={tasks.length}
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-block text-muted-foreground"
          >
            ({tasks.length})
          </motion.span>
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Нет задач
            </motion.p>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                layoutId={task.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={cardTransition}
              >
                <TaskCard
                  task={task}
                  isDragPlaceholder={activeDragTaskId === task.id}
                  onDeleted={onTaskDeleted}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
