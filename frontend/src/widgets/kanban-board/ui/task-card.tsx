import type { CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import { TASK_PRIORITY_LABELS, type Task } from '@/entities/task'
import { cn } from '@/shared/lib/cn'
import {
  PRIORITY_BADGE,
  PRIORITY_META,
  formatRelativeDate,
} from '../lib/task-card-styles'
import { TaskCardMenu } from './task-card-menu'

interface TaskCardProps {
  readonly task: Task
  readonly isDragOverlay?: boolean
  readonly isDragPlaceholder?: boolean
  readonly onDeleted?: () => void
}

type SortableAttributes = ReturnType<typeof useSortable>['attributes']
type SortableListeners = ReturnType<typeof useSortable>['listeners']

interface TaskCardContentProps {
  readonly task: Task
  readonly isDragging?: boolean
  readonly isDragOverlay?: boolean
  readonly isDragPlaceholder?: boolean
  readonly isDraggable?: boolean
  readonly style?: CSSProperties
  readonly setNodeRef?: (node: HTMLElement | null) => void
  readonly onDeleted?: () => void
  readonly attributes?: SortableAttributes
  readonly listeners?: SortableListeners
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
  const PriorityIcon = PRIORITY_META[task.priority].icon

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm transition-[box-shadow,transform,opacity] duration-150 ease-out',
        !isHiddenPlaceholder && !isDragOverlay && 'hover:shadow-card-hover',
        isHiddenPlaceholder && 'pointer-events-none opacity-0',
        isDragOverlay &&
          'rotate-[1.5deg] scale-[1.02] opacity-100 shadow-drag ring-1 ring-border transition-none',
      )}
    >
      <div className="flex items-start gap-1 p-3">
        <div
          className={cn(
            'flex min-w-0 flex-1 items-start gap-1',
            isDraggable && 'cursor-grab touch-none active:cursor-grabbing',
          )}
          aria-label={isDraggable ? 'Перетащить задачу' : undefined}
          {...(isDraggable ? listeners : undefined)}
          {...(isDraggable ? attributes : undefined)}
        >
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md text-placeholder">
            <GripVertical className="size-4" aria-hidden />
          </span>

          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <h3 className="break-words pr-1 text-[15px] leading-snug font-semibold text-foreground">
              {task.title}
            </h3>

            {task.description ? (
              <p className="line-clamp-2 break-words text-caption leading-relaxed text-muted-foreground">
                {task.description}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-caption font-medium',
                  PRIORITY_BADGE[task.priority],
                )}
              >
                <PriorityIcon className="size-3" aria-hidden />
                {TASK_PRIORITY_LABELS[task.priority]}
              </span>
              <time
                dateTime={task.updatedAt}
                className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-caption font-medium text-muted-foreground tabular-nums"
              >
                {formatRelativeDate(task.updatedAt)}
              </time>
            </div>
          </div>
        </div>

        {!isDragOverlay ? (
          <TaskCardMenu task={task} onDeleted={onDeleted} />
        ) : null}
      </div>
    </article>
  )
}

function SortableTaskCard({
  task,
  isDragPlaceholder = false,
  onDeleted,
}: {
  readonly task: Task
  readonly isDragPlaceholder?: boolean
  readonly onDeleted?: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      status: task.status,
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
        transform: CSS.Transform.toString(transform),
        transition,
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
    <SortableTaskCard
      task={task}
      isDragPlaceholder={isDragPlaceholder}
      onDeleted={onDeleted}
    />
  )
}
