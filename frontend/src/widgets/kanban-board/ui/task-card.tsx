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
  readonly isDragPlaceholder?: boolean
  readonly onDeleted?: () => void
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'border-priority-low/30 bg-muted text-priority-low',
  [TASK_PRIORITY.MEDIUM]:
    'border-priority-medium/30 bg-warning/10 text-priority-medium',
  [TASK_PRIORITY.HIGH]:
    'border-priority-high/30 bg-destructive/10 text-priority-high',
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
  readonly isDragPlaceholder?: boolean
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
  isDragPlaceholder = false,
  isDraggable = false,
  style,
  setNodeRef,
  onDeleted,
  attributes,
  listeners,
}: TaskCardContentProps) {
  const isHiddenPlaceholder = isDragging || isDragPlaceholder

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-card border border-border bg-card p-4 shadow-card transition-[opacity,box-shadow,border-color] duration-150 ease-out',
        !isHiddenPlaceholder &&
          !isDragOverlay &&
          'hover:border-border-hover',
        isHiddenPlaceholder && 'pointer-events-none opacity-0',
        isDragOverlay &&
          'rotate-2 scale-[1.02] opacity-100 shadow-modal ring-1 ring-border transition-none',
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
          <h3 className="text-small font-medium text-foreground">
            {task.title}
          </h3>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-caption font-medium',
              PRIORITY_STYLES[task.priority],
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
        </div>

        {task.description ? (
          <p className="line-clamp-3 text-small text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <p className="text-caption text-muted-foreground">
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
  isDragPlaceholder = false,
  onDeleted,
}: {
  readonly task: Task
  readonly isDragPlaceholder?: boolean
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
      isDragPlaceholder={isDragPlaceholder}
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
  isDragPlaceholder = false,
  onDeleted,
}: TaskCardProps) {
  if (isDragOverlay) {
    return <TaskCardContent task={task} isDragOverlay />
  }

  return (
    <DraggableTaskCard
      task={task}
      isDragPlaceholder={isDragPlaceholder}
      onDeleted={onDeleted}
    />
  )
}
