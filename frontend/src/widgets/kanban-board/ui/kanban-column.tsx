import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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
  stiffness: 520,
  damping: 36,
  mass: 0.7,
}

const COLUMN_OVER: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: 'ring-2 ring-primary/20',
  [TASK_STATUS.IN_PROGRESS]: 'ring-2 ring-primary/25',
  [TASK_STATUS.DONE]: 'ring-2 ring-success/25',
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

  const itemIds = tasks.map((task) => task.id)

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex min-h-64 min-w-0 flex-col rounded-xl border border-border/70 bg-card transition-shadow duration-150',
        isOver && COLUMN_OVER[status],
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <h2 className="text-small font-semibold tracking-tight text-foreground">
          {TASK_STATUS_LABELS[status]}
        </h2>
        <motion.span
          key={tasks.length}
          initial={{ opacity: 0.4, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-caption font-semibold text-muted-foreground tabular-nums"
        >
          {tasks.length}
        </motion.span>
      </header>

      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-2.5">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'px-2 py-6 text-center text-caption text-muted-foreground',
                  isOver && 'text-primary',
                )}
              >
                {isOver ? 'Отпустите карточку' : 'Пока нет задач'}
              </motion.p>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  layoutId={task.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
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
        </SortableContext>
      </div>
    </section>
  )
}
