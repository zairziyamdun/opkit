import {
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '@/entities/task'
import { cn } from '@/shared/lib/cn'

const badgeBase =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium'

const STATUS_STYLES: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: 'border-stone-300 bg-stone-100 text-stone-700',
  [TASK_STATUS.IN_PROGRESS]: 'border-blue-200 bg-blue-50 text-blue-700',
  [TASK_STATUS.DONE]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'border-stone-300 bg-stone-100 text-stone-600',
  [TASK_PRIORITY.MEDIUM]: 'border-amber-200 bg-amber-50 text-amber-700',
  [TASK_PRIORITY.HIGH]: 'border-red-200 bg-red-50 text-red-700',
}

export function TaskStatusBadge({ status }: { readonly status: TaskStatus }) {
  return (
    <span className={cn(badgeBase, STATUS_STYLES[status])}>
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

export function TaskPriorityBadge({
  priority,
}: {
  readonly priority: TaskPriority
}) {
  return (
    <span className={cn(badgeBase, PRIORITY_STYLES[priority])}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  )
}
