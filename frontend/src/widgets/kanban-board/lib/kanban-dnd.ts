import type { DropAnimation, UniqueIdentifier } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  TASK_STATUS,
  type Task,
  type TaskStatus,
} from '@/entities/task'
import type { KanbanColumns } from './group-tasks-by-status'
import { KANBAN_COLUMN_ORDER } from './group-tasks-by-status'

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

export function findTaskContainer(
  id: UniqueIdentifier,
  columns: KanbanColumns,
): TaskStatus | null {
  const value = String(id)

  if (isTaskStatus(value)) {
    return value
  }

  for (const status of KANBAN_COLUMN_ORDER) {
    if (columns[status].some((task) => task.id === value)) {
      return status
    }
  }

  return null
}

export function resolveDropPosition(
  overId: UniqueIdentifier,
  overContainer: TaskStatus,
  columns: KanbanColumns,
  activeId: UniqueIdentifier,
): number {
  const overValue = String(overId)
  const items = columns[overContainer]

  if (isTaskStatus(overValue)) {
    return items.filter((task) => task.id !== String(activeId)).length
  }

  const overIndex = items.findIndex((task) => task.id === overValue)

  if (overIndex === -1) {
    return items.filter((task) => task.id !== String(activeId)).length
  }

  const activeContainer = findTaskContainer(activeId, columns)

  if (activeContainer === overContainer) {
    const activeIndex = items.findIndex((task) => task.id === String(activeId))

    if (activeIndex !== -1 && activeIndex < overIndex) {
      return overIndex
    }
  }

  return overIndex
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
