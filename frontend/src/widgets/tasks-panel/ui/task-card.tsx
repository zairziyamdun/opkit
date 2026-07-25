import type { Task } from '@/entities/task'
import { TaskPriorityBadge, TaskStatusBadge } from './task-badges'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function TaskCard({ task }: { readonly task: Task }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Создана {formatDate(task.createdAt)}
      </p>
    </article>
  )
}
