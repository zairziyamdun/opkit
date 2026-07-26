import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  type Task,
  type TaskStatus,
} from '@/entities/task'
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

const COLUMN_STYLES: Record<
  TaskStatus,
  {
    readonly surface: string
    readonly header: string
    readonly over: string
  }
> = {
  [TASK_STATUS.TODO]: {
    surface: 'border-status-todo-border bg-status-todo-bg',
    header: 'text-status-todo-fg',
    over: 'ring-2 ring-primary/20 border-primary/40',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    surface: 'border-status-progress-border bg-status-progress-bg',
    header: 'text-status-progress-fg',
    over: 'ring-2 ring-primary/25 border-primary',
  },
  [TASK_STATUS.DONE]: {
    surface: 'border-status-done-border bg-status-done-bg',
    header: 'text-status-done-fg',
    over: 'ring-2 ring-success/25 border-success/50',
  },
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

  const styles = COLUMN_STYLES[status]

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-72 min-w-0 flex-1 flex-col rounded-card border transition-all duration-200 ease-out',
        styles.surface,
        isOver && styles.over,
      )}
    >
      <header className="border-b border-inherit px-4 py-3">
        <h2
          className={cn(
            'text-small font-semibold tracking-tight',
            styles.header,
          )}
        >
          {TASK_STATUS_LABELS[status]}{' '}
          <motion.span
            key={tasks.length}
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-block opacity-80"
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
              className="py-6 text-center text-small text-muted-foreground"
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
