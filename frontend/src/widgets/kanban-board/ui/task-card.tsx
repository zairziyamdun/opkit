import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TASK_PRIORITY_LABELS, type Task } from '@/entities/task'
import { DeleteTaskButton } from '@/features/delete-task'
import { UpdateTaskButton } from '@/features/update-task'
import { cn } from '@/shared/lib/cn'
import {
  PRIORITY_ACCENT,
  PRIORITY_META,
  formatRelativeDate,
} from '../lib/task-card-styles'

interface TaskCardProps {
  readonly task: Task
  readonly isDragOverlay?: boolean
  readonly isDragPlaceholder?: boolean
  readonly onDeleted?: () => void
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
  const priority = PRIORITY_META[task.priority]
  const PriorityIcon = priority.icon

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-[8px] border border-transparent border-l-[3px] bg-card shadow-card transition-[box-shadow,transform,opacity] duration-150 ease-out',
        PRIORITY_ACCENT[task.priority],
        !isHiddenPlaceholder && !isDragOverlay && 'hover:shadow-card-hover',
        isHiddenPlaceholder && 'pointer-events-none opacity-0',
        isDragOverlay &&
          'rotate-[1.5deg] scale-[1.03] border-border opacity-100 shadow-drag ring-1 ring-border/80 transition-none',
      )}
    >
      <div
        className={cn(
          'space-y-2 p-3',
          isDraggable && 'cursor-grab active:cursor-grabbing',
        )}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-start gap-1.5">
          <GripVertical
            className={cn(
              'mt-0.5 size-4 shrink-0 text-placeholder transition-opacity',
              isDraggable || isDragOverlay
                ? 'opacity-50 group-hover:opacity-100'
                : 'opacity-0',
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-small leading-snug font-semibold text-foreground">
              {task.title}
            </h3>

            {task.description ? (
              <p className="line-clamp-2 text-caption leading-relaxed text-muted-foreground">
                {task.description}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-caption font-medium',
                  priority.className,
                )}
                title={`Приоритет: ${TASK_PRIORITY_LABELS[task.priority]}`}
              >
                <PriorityIcon className="size-3.5" aria-hidden />
                {TASK_PRIORITY_LABELS[task.priority]}
              </span>
              <time
                dateTime={task.updatedAt}
                className="text-caption text-muted-foreground tabular-nums"
              >
                {formatRelativeDate(task.updatedAt)}
              </time>
            </div>
          </div>
        </div>
      </div>

      {!isDragOverlay ? (
        <div className="flex items-center gap-1.5 border-t border-border/60 px-2 py-1.5">
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
