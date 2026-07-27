import type {
  PaginatedTasks,
  PaginationMeta,
  Task,
  TaskListQuery,
  TaskStatus,
} from '../model/types'
import { SORT_ORDER, TASK_SORT_BY } from '../model/types'

function buildMeta(previous: PaginationMeta, total: number): PaginationMeta {
  const safeTotal = Math.max(0, total)
  const totalPages =
    safeTotal === 0 ? 0 : Math.ceil(safeTotal / previous.limit)

  return {
    ...previous,
    total: safeTotal,
    totalPages,
    hasNextPage: previous.page < totalPages,
    hasPreviousPage: previous.page > 1 && totalPages > 0,
  }
}

function sortByPosition(items: readonly Task[]): Task[] {
  return [...items].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status.localeCompare(right.status)
    }

    return left.position - right.position
  })
}

/**
 * Optimistic board move: updates status/position and reorders list items.
 */
export function applyOptimisticReorderToList(
  data: PaginatedTasks,
  query: TaskListQuery,
  id: string,
  status: TaskStatus,
  position: number,
  updatedAt: string,
): PaginatedTasks {
  const existingIndex = data.items.findIndex((task) => task.id === id)

  if (existingIndex === -1) {
    return data
  }

  const existing = data.items[existingIndex]

  if (!existing) {
    return data
  }

  if (
    existing.status === status &&
    existing.position === position &&
    existing.updatedAt >= updatedAt
  ) {
    return data
  }

  if (query.status && query.status !== status) {
    return {
      items: data.items.filter((task) => task.id !== id),
      meta: buildMeta(data.meta, data.meta.total - 1),
    }
  }

  const withoutTask = data.items.filter((task) => task.id !== id)
  const moved: Task = {
    ...existing,
    status,
    position,
    updatedAt,
  }

  const sameStatus = withoutTask.filter((task) => task.status === status)
  const otherStatus = withoutTask.filter((task) => task.status !== status)

  const clamped = Math.max(0, Math.min(position, sameStatus.length))
  const reindexedSame = [
    ...sameStatus.slice(0, clamped),
    moved,
    ...sameStatus.slice(clamped),
  ].map((task, index) =>
    task.status === status ? { ...task, position: index } : task,
  )

  const nextItems = [...otherStatus, ...reindexedSame]
  const sortBy = query.sortBy ?? TASK_SORT_BY.Position
  const sortOrder = query.sortOrder ?? SORT_ORDER.Asc

  const ordered =
    sortBy === TASK_SORT_BY.Position
      ? sortOrder === SORT_ORDER.Asc
        ? sortByPosition(nextItems)
        : sortByPosition(nextItems).reverse()
      : nextItems.map((task) => (task.id === id ? moved : task))

  return {
    ...data,
    items: ordered,
  }
}
