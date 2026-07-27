import {
  TASK_PRIORITY,
  TASK_STATUS,
  type TaskPriority,
  type TaskStatus,
} from './types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: 'К выполнению',
  [TASK_STATUS.IN_PROGRESS]: 'В работе',
  [TASK_STATUS.DONE]: 'Выполнено',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'Низкий',
  [TASK_PRIORITY.MEDIUM]: 'Средний',
  [TASK_PRIORITY.HIGH]: 'Высокий',
}
