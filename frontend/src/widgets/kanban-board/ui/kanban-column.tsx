import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { CheckCircle2, Circle, CircleDot } from 'lucide-react'
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
  stiffness: 520,
  damping: 36,
  mass: 0.7,
}

const COLUMN_META: Record<
  TaskStatus,
  {
    readonly icon: typeof Circle
    readonly badge: string
    readonly iconClass: string
    readonly over: string
  }
> = {
  [TASK_STATUS.TODO]: {
    icon: Circle,
    badge: 'bg-slate-200 text-status-todo-fg',
    iconClass: 'text-status-todo-fg',
    over: 'bg-primary/5 ring-2 ring-primary/25',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    icon: CircleDot,
    badge: 'bg-status-progress-bg text-status-progress-fg',
    iconClass: 'text-status-progress-fg',
    over: 'bg-status-progress-bg/80 ring-2 ring-primary/30',
  },
  [TASK_STATUS.DONE]: {
    icon: CheckCircle2,
    badge: 'bg-status-done-bg text-status-done-fg',
    iconClass: 'text-status-done-fg',
    over: 'bg-status-done-bg/80 ring-2 ring-success/30',
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

  const meta = COLUMN_META[status]
  const Icon = meta.icon

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex max-h-[min(72vh,760px)] min-h-[28rem] w-full min-w-[280px] flex-1 flex-col rounded-xl bg-column transition-all duration-200 ease-out lg:max-w-sm',
        isOver && meta.over,
      )}
    >
      <header className="sticky top-0 z-10 flex items-center gap-2 px-3 pt-3 pb-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold tracking-tight',
            meta.badge,
          )}
        >
          <Icon className={cn('size-3.5', meta.iconClass)} aria-hidden />
          {TASK_STATUS_LABELS[status]}
        </span>
        <motion.span
          key={tasks.length}
          initial={{ opacity: 0.4, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="inline-flex min-w-6 items-center justify-center rounded-full bg-slate-300/60 px-1.5 py-0.5 text-caption font-semibold text-foreground-body tabular-nums"
        >
          {tasks.length}
        </motion.span>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'mt-1 flex flex-1 items-center justify-center rounded-lg border border-dashed border-border-hover px-3 py-10 text-center text-caption text-muted-foreground transition-colors',
                isOver && 'border-primary/40 bg-card/60 text-primary',
              )}
            >
              {isOver ? 'Отпустите карточку' : 'Перетащите задачу сюда'}
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                layoutId={task.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
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
