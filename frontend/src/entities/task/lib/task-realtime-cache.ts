import {
  SORT_ORDER,
  TASK_SORT_BY,
  type PaginatedTasks,
  type PaginationMeta,
  type Task,
  type TaskListQuery,
  type TaskSortBy,
} from '../model/types'
import type {
  TaskDeletedPayload,
  TaskStatusChangedPayload,
} from '@/shared/api/socket'

export type TaskListCacheResult =
  | { readonly type: 'none' }
  | { readonly type: 'update'; readonly data: PaginatedTasks }
  | { readonly type: 'invalidate' }

const NONE: TaskListCacheResult = { type: 'none' }
const INVALIDATE: TaskListCacheResult = { type: 'invalidate' }

export function matchesTaskFilters(
  task: Task,
  query: TaskListQuery,
): boolean {
  if (query.status && task.status !== query.status) {
    return false
  }

  if (query.priority && task.priority !== query.priority) {
    return false
  }

  if (query.search) {
    const search = query.search.toLowerCase()
    const matchesTitle = task.title.toLowerCase().includes(search)
    const matchesDescription =
      task.description?.toLowerCase().includes(search) ?? false

    if (!matchesTitle && !matchesDescription) {
      return false
    }
  }

  return true
}

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

function removeTaskFromList(
  data: PaginatedTasks,
  taskId: string,
): TaskListCacheResult {
  // Если есть следующая страница, локальное удаление сделает страницу
  // неполной — надёжнее перезапросить этот список.
  if (data.meta.hasNextPage) {
    return INVALIDATE
  }

  return {
    type: 'update',
    data: {
      items: data.items.filter((task) => task.id !== taskId),
      meta: buildMeta(data.meta, data.meta.total - 1),
    },
  }
}

function isSortFieldChanged(
  previous: Task,
  next: Task,
  sortBy: TaskSortBy,
): boolean {
  switch (sortBy) {
    case TASK_SORT_BY.CreatedAt:
      return previous.createdAt !== next.createdAt
    case TASK_SORT_BY.UpdatedAt:
      return previous.updatedAt !== next.updatedAt
    case TASK_SORT_BY.Title:
      return previous.title !== next.title
    case TASK_SORT_BY.Priority:
      return previous.priority !== next.priority
    case TASK_SORT_BY.Status:
      return previous.status !== next.status
  }
}

export function applyTaskCreated(
  data: PaginatedTasks,
  query: TaskListQuery,
  task: Task,
): TaskListCacheResult {
  if (data.items.some((item) => item.id === task.id)) {
    return NONE
  }

  if (!matchesTaskFilters(task, query)) {
    return NONE
  }

  const page = query.page ?? 1
  const limit = query.limit ?? data.meta.limit
  const sortBy = query.sortBy ?? TASK_SORT_BY.CreatedAt
  const sortOrder = query.sortOrder ?? SORT_ORDER.Desc

  const canPrepend =
    page === 1 &&
    sortBy === TASK_SORT_BY.CreatedAt &&
    sortOrder === SORT_ORDER.Desc

  if (!canPrepend) {
    return INVALIDATE
  }

  return {
    type: 'update',
    data: {
      items: [task, ...data.items].slice(0, limit),
      meta: buildMeta(data.meta, data.meta.total + 1),
    },
  }
}

export function applyTaskUpdated(
  data: PaginatedTasks,
  query: TaskListQuery,
  task: Task,
): TaskListCacheResult {
  const existing = data.items.find((item) => item.id === task.id)

  if (!existing) {
    // Задачи нет на этой странице, но после обновления она может
    // соответствовать фильтрам этого списка.
    return matchesTaskFilters(task, query) ? INVALIDATE : NONE
  }

  // Кэш уже содержит эти или более свежие данные (например, собственная
  // mutation уже обновила список) — событие идемпотентно игнорируется.
  if (existing.updatedAt >= task.updatedAt) {
    return NONE
  }

  if (!matchesTaskFilters(task, query)) {
    return removeTaskFromList(data, task.id)
  }

  const sortBy = query.sortBy ?? TASK_SORT_BY.CreatedAt

  if (isSortFieldChanged(existing, task, sortBy)) {
    return INVALIDATE
  }

  return {
    type: 'update',
    data: {
      ...data,
      items: data.items.map((item) => (item.id === task.id ? task : item)),
    },
  }
}

export function applyTaskStatusChanged(
  data: PaginatedTasks,
  query: TaskListQuery,
  payload: TaskStatusChangedPayload,
): TaskListCacheResult {
  const existing = data.items.find((item) => item.id === payload.id)

  if (!existing) {
    // Задача могла начать соответствовать активному status-фильтру.
    return query.status === payload.status ? INVALIDATE : NONE
  }

  if (existing.status === payload.status) {
    return NONE
  }

  // Кэш содержит более позднюю запись, чем момент события — не откатываем.
  if (existing.updatedAt > payload.timestamp) {
    return NONE
  }

  if (query.status && query.status !== payload.status) {
    return removeTaskFromList(data, payload.id)
  }

  const sortBy = query.sortBy ?? TASK_SORT_BY.CreatedAt

  if (sortBy === TASK_SORT_BY.Status || sortBy === TASK_SORT_BY.UpdatedAt) {
    return INVALIDATE
  }

  return {
    type: 'update',
    data: {
      ...data,
      items: data.items.map((item) =>
        item.id === payload.id ? { ...item, status: payload.status } : item,
      ),
    },
  }
}

export function applyTaskDeleted(
  data: PaginatedTasks,
  payload: TaskDeletedPayload,
): TaskListCacheResult {
  const exists = data.items.some((item) => item.id === payload.id)

  if (!exists) {
    return NONE
  }

  return removeTaskFromList(data, payload.id)
}
