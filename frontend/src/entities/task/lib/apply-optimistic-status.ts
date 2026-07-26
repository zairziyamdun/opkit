import type {
  PaginatedTasks,
  PaginationMeta,
  TaskListQuery,
  TaskStatus,
} from '../model/types'

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

/**
 * Instant Kanban move: update status in a list cache (or remove if status filter
 * no longer matches). Does not invalidate — used by optimistic mutations.
 */
export function applyOptimisticStatusToList(
  data: PaginatedTasks,
  query: TaskListQuery,
  id: string,
  status: TaskStatus,
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

  if (existing.status === status && existing.updatedAt >= updatedAt) {
    return data
  }

  if (query.status && query.status !== status) {
    return {
      items: data.items.filter((task) => task.id !== id),
      meta: buildMeta(data.meta, data.meta.total - 1),
    }
  }

  const nextItems = data.items.map((task) =>
    task.id === id ? { ...task, status, updatedAt } : task,
  )

  return {
    ...data,
    items: nextItems,
  }
}

export function findTaskStatusInLists(
  entries: ReadonlyArray<readonly [readonly unknown[], PaginatedTasks | undefined]>,
  taskId: string,
): TaskStatus | null {
  for (const [, data] of entries) {
    const task = data?.items.find((item) => item.id === taskId)

    if (task) {
      return task.status
    }
  }

  return null
}
