import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus } from '@/entities/task'
import { cn } from '@/shared/lib/cn'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  readonly status: TaskStatus
  readonly tasks: readonly Task[]
  readonly onTaskDeleted?: () => void
}

export function KanbanColumn({
  status,
  tasks,
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
        'flex min-h-72 min-w-0 flex-1 flex-col rounded-lg border border-border bg-muted/40',
        isOver && 'border-primary/40 bg-primary/5',
      )}
    >
      <header className="border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {status} ({tasks.length})
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Нет задач
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDeleted={onTaskDeleted}
            />
          ))
        )}
      </div>
    </section>
  )
}
