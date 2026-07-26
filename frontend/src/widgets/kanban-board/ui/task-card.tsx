import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
} from '@/entities/task'
import { DeleteTaskButton } from '@/features/delete-task'
import { UpdateTaskButton } from '@/features/update-task'
import { cn } from '@/shared/lib/cn'

interface TaskCardProps {
  readonly task: Task
  readonly isDragOverlay?: boolean
  readonly onDeleted?: () => void
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'border-stone-300 bg-stone-100 text-stone-600',
  [TASK_PRIORITY.MEDIUM]: 'border-amber-200 bg-amber-50 text-amber-700',
  [TASK_PRIORITY.HIGH]: 'border-red-200 bg-red-50 text-red-700',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

interface TaskCardContentProps {
  readonly task: Task
  readonly isDragging?: boolean
  readonly isDragOverlay?: boolean
  readonly isDraggable?: boolean
  readonly style?: CSSProperties
  readonly setNodeRef?: (node: HTMLElement | null) => void
  readonly onDeleted?: () => void
  readonly attributes?: ReturnType<typeof useDraggable>['attributes']
  readonly listeners?: ReturnType<typeof useDraggable>['listeners']
}

function TaskCardContent({
  task,
  isDragging = false,
  isDragOverlay = false,
  isDraggable = false,
  style,
  setNodeRef,
  onDeleted,
  attributes,
  listeners,
}: TaskCardContentProps) {
  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card p-3 shadow-sm',
        isDragging && 'opacity-40',
        isDragOverlay && 'shadow-lg ring-1 ring-border',
      )}
    >
      <div
        className={cn(
          'space-y-2',
          isDraggable && 'cursor-grab active:cursor-grabbing',
        )}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
              PRIORITY_STYLES[task.priority],
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
        </div>

        {task.description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Обновлена {formatDate(task.updatedAt)}
        </p>
      </div>

      {!isDragOverlay ? (
        <div className="mt-3 flex items-center gap-2">
          <UpdateTaskButton task={task} />
          <DeleteTaskButton task={task} onDeleted={onDeleted} />
        </div>
      ) : null}
    </article>
  )
}

function DraggableTaskCard({
  task,
  onDeleted,
}: {
  readonly task: Task
  readonly onDeleted?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: 'task',
        task,
      },
    })

  return (
    <TaskCardContent
      task={task}
      isDragging={isDragging}
      isDraggable
      setNodeRef={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      attributes={attributes}
      listeners={listeners}
      onDeleted={onDeleted}
    />
  )
}

export function TaskCard({
  task,
  isDragOverlay = false,
  onDeleted,
}: TaskCardProps) {
  if (isDragOverlay) {
    return <TaskCardContent task={task} isDragOverlay />
  }

  return <DraggableTaskCard task={task} onDeleted={onDeleted} />
}
