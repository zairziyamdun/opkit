import { ArrowDown, ArrowUp, ChevronsUp } from 'lucide-react'
import { TASK_PRIORITY, type TaskPriority } from '@/entities/task'

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'bg-muted text-priority-low',
  [TASK_PRIORITY.MEDIUM]: 'bg-warning/10 text-priority-medium',
  [TASK_PRIORITY.HIGH]: 'bg-destructive/10 text-priority-high',
}

export const PRIORITY_META: Record<
  TaskPriority,
  {
    readonly icon: typeof ArrowDown
  }
> = {
  [TASK_PRIORITY.LOW]: {
    icon: ArrowDown,
  },
  [TASK_PRIORITY.MEDIUM]: {
    icon: ArrowUp,
  },
  [TASK_PRIORITY.HIGH]: {
    icon: ChevronsUp,
  },
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  )

  if (diffDays <= 0) {
    return 'Сегодня'
  }

  if (diffDays === 1) {
    return 'Вчера'
  }

  if (diffDays < 7) {
    return `${diffDays} дн. назад`
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
