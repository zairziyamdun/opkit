import {
  TASK_STATUS,
  type Task,
  type TaskStatus,
} from '@/entities/task'

export const KANBAN_COLUMN_ORDER = [
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
] as const satisfies readonly TaskStatus[]

export type KanbanColumns = Record<TaskStatus, readonly Task[]>

export function groupTasksByStatus(tasks: readonly Task[]): KanbanColumns {
  const columns: Record<TaskStatus, Task[]> = {
    [TASK_STATUS.TODO]: [],
    [TASK_STATUS.IN_PROGRESS]: [],
    [TASK_STATUS.DONE]: [],
  }

  for (const task of tasks) {
    columns[task.status].push(task)
  }

  return columns
}
