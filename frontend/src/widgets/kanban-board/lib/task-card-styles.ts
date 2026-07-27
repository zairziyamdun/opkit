import { ArrowDown, ArrowUp, ChevronsUp } from 'lucide-react'
import {
  TASK_PRIORITY,
  type TaskPriority,
} from '@/entities/task'

export const PRIORITY_ACCENT: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'border-l-priority-low',
  [TASK_PRIORITY.MEDIUM]: 'border-l-priority-medium',
  [TASK_PRIORITY.HIGH]: 'border-l-priority-high',
}

export const PRIORITY_META: Record<
  TaskPriority,
  {
    readonly icon: typeof ArrowDown
    readonly className: string
  }
> = {
  [TASK_PRIORITY.LOW]: {
    icon: ArrowDown,
    className: 'text-priority-low',
  },
  [TASK_PRIORITY.MEDIUM]: {
    icon: ArrowUp,
    className: 'text-priority-medium',
  },
  [TASK_PRIORITY.HIGH]: {
    icon: ChevronsUp,
    className: 'text-priority-high',
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
    return 'сегодня'
  }

  if (diffDays === 1) {
    return 'вчера'
  }

  if (diffDays < 7) {
    return `${diffDays} дн. назад`
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
