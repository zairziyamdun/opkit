import type { DropAnimation } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  TASK_STATUS,
  type Task,
  type TaskStatus,
} from '@/entities/task'

export const DROP_FADE_MS = 180

export const dropAnimation: DropAnimation = {
  duration: DROP_FADE_MS,
  easing: 'ease-out',
  keyframes({ transform }) {
    return [
      {
        opacity: 1,
        transform: CSS.Transform.toString(transform.initial),
      },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.initial,
          scaleX: 0.98,
          scaleY: 0.98,
        }),
      },
    ]
  },
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (
    value === TASK_STATUS.TODO ||
    value === TASK_STATUS.IN_PROGRESS ||
    value === TASK_STATUS.DONE
  )
}

export function resolveTargetStatus(
  overId: string | number,
  tasksById: ReadonlyMap<string, Task>,
): TaskStatus | null {
  const id = String(overId)

  if (isTaskStatus(id)) {
    return id
  }

  return tasksById.get(id)?.status ?? null
}
