import { describe, expect, it } from 'vitest'
import {
  SORT_ORDER,
  TASK_PRIORITY,
  TASK_SORT_BY,
  TASK_STATUS,
} from '../model/types'
import type { PaginatedTasks, Task, TaskListQuery } from '../model/types'
import {
  applyTaskCreated,
  applyTaskDeleted,
  applyTaskStatusChanged,
  applyTaskUpdated,
  matchesTaskFilters,
} from './task-realtime-cache'

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Report',
    description: 'Quarterly report',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    userId: 'user-1',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
    ...overrides,
  }
}

function createList(
  items: readonly Task[],
  metaOverrides: Partial<PaginatedTasks['meta']> = {},
): PaginatedTasks {
  return {
    items,
    meta: {
      page: 1,
      limit: 10,
      total: items.length,
      totalPages: items.length === 0 ? 0 : 1,
      hasNextPage: false,
      hasPreviousPage: false,
      ...metaOverrides,
    },
  }
}

const defaultQuery: TaskListQuery = {
  page: 1,
  limit: 10,
  sortBy: TASK_SORT_BY.CreatedAt,
  sortOrder: SORT_ORDER.Desc,
}

describe('matchesTaskFilters', () => {
  it('учитывает status, priority и search', () => {
    const task = createTask()

    expect(matchesTaskFilters(task, {})).toBe(true)
    expect(matchesTaskFilters(task, { status: TASK_STATUS.TODO })).toBe(true)
    expect(matchesTaskFilters(task, { status: TASK_STATUS.DONE })).toBe(false)
    expect(matchesTaskFilters(task, { priority: TASK_PRIORITY.HIGH })).toBe(
      false,
    )
    expect(matchesTaskFilters(task, { search: 'report' })).toBe(true)
    expect(matchesTaskFilters(task, { search: 'quarterly' })).toBe(true)
    expect(matchesTaskFilters(task, { search: 'missing' })).toBe(false)
  })
})

describe('applyTaskStatusChanged', () => {
  it('обновляет статус существующей задачи', () => {
    const task = createTask()
    const data = createList([task])

    const result = applyTaskStatusChanged(data, defaultQuery, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items[0]?.status).toBe(TASK_STATUS.DONE)
      expect(result.data.items[0]?.title).toBe(task.title)
      expect(result.data.items).not.toBe(data.items)
    }
  })

  it('повторное одинаковое событие ничего не меняет', () => {
    const task = createTask({ status: TASK_STATUS.DONE })
    const data = createList([task])

    const result = applyTaskStatusChanged(data, defaultQuery, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('none')
  })

  it('не откатывает более свежие данные устаревшим событием', () => {
    const task = createTask({ updatedAt: '2026-07-25T12:00:00.000Z' })
    const data = createList([task])

    const result = applyTaskStatusChanged(data, defaultQuery, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('none')
  })

  it('удаляет задачу из списка с несоответствующим status-фильтром', () => {
    const task = createTask()
    const data = createList([task])
    const query: TaskListQuery = { ...defaultQuery, status: TASK_STATUS.TODO }

    const result = applyTaskStatusChanged(data, query, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items).toHaveLength(0)
      expect(result.data.meta.total).toBe(0)
    }
  })

  it('инвалидирует список с status-фильтром при удалении, если есть следующая страница', () => {
    const task = createTask()
    const data = createList([task], { total: 15, totalPages: 2, hasNextPage: true })
    const query: TaskListQuery = { ...defaultQuery, status: TASK_STATUS.TODO }

    const result = applyTaskStatusChanged(data, query, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('invalidate')
  })

  it('инвалидирует список, если задача начала соответствовать status-фильтру', () => {
    const data = createList([])
    const query: TaskListQuery = { ...defaultQuery, status: TASK_STATUS.DONE }

    const result = applyTaskStatusChanged(data, query, {
      id: 'task-x',
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('invalidate')
  })

  it('инвалидирует при сортировке по status', () => {
    const task = createTask()
    const data = createList([task])
    const query: TaskListQuery = {
      ...defaultQuery,
      sortBy: TASK_SORT_BY.Status,
    }

    const result = applyTaskStatusChanged(data, query, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('invalidate')
  })

  it('событие для отсутствующей задачи без совпадения фильтра безопасно', () => {
    const data = createList([createTask()])

    const result = applyTaskStatusChanged(data, defaultQuery, {
      id: 'unknown-task',
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('none')
  })
})

describe('applyTaskUpdated', () => {
  it('заменяет существующую задачу', () => {
    const task = createTask()
    const updated = createTask({
      description: 'New description',
      updatedAt: '2026-07-25T11:00:00.000Z',
    })
    const data = createList([task])

    const result = applyTaskUpdated(data, defaultQuery, updated)

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items[0]?.description).toBe('New description')
    }
  })

  it('идемпотентен: повторное событие с тем же updatedAt ничего не меняет', () => {
    const task = createTask({ updatedAt: '2026-07-25T11:00:00.000Z' })
    const data = createList([task])

    const result = applyTaskUpdated(data, defaultQuery, task)

    expect(result.type).toBe('none')
  })

  it('удаляет задачу, переставшую соответствовать фильтрам', () => {
    const task = createTask()
    const updated = createTask({
      priority: TASK_PRIORITY.LOW,
      updatedAt: '2026-07-25T11:00:00.000Z',
    })
    const data = createList([task])
    const query: TaskListQuery = {
      ...defaultQuery,
      priority: TASK_PRIORITY.MEDIUM,
    }

    const result = applyTaskUpdated(data, query, updated)

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items).toHaveLength(0)
    }
  })

  it('инвалидирует при изменении поля активной сортировки', () => {
    const task = createTask()
    const updated = createTask({
      title: 'Zzz renamed',
      updatedAt: '2026-07-25T11:00:00.000Z',
    })
    const data = createList([task])
    const query: TaskListQuery = { ...defaultQuery, sortBy: TASK_SORT_BY.Title }

    const result = applyTaskUpdated(data, query, updated)

    expect(result.type).toBe('invalidate')
  })

  it('инвалидирует список, где задачи нет, но она соответствует фильтрам', () => {
    const data = createList([])
    const updated = createTask({ updatedAt: '2026-07-25T11:00:00.000Z' })

    const result = applyTaskUpdated(data, defaultQuery, updated)

    expect(result.type).toBe('invalidate')
  })
})

describe('applyTaskCreated', () => {
  it('добавляет задачу в начало первой страницы с сортировкой createdAt desc', () => {
    const existing = createTask({ id: 'task-old' })
    const created = createTask({ id: 'task-new' })
    const data = createList([existing])

    const result = applyTaskCreated(data, defaultQuery, created)

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items[0]?.id).toBe('task-new')
      expect(result.data.meta.total).toBe(2)
    }
  })

  it('не создаёт дубликат', () => {
    const task = createTask()
    const data = createList([task])

    const result = applyTaskCreated(data, defaultQuery, task)

    expect(result.type).toBe('none')
  })

  it('обрезает список до limit', () => {
    const items = Array.from({ length: 10 }, (_, index) =>
      createTask({ id: `task-${index}` }),
    )
    const data = createList(items, { total: 10 })
    const created = createTask({ id: 'task-new' })

    const result = applyTaskCreated(data, defaultQuery, created)

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items).toHaveLength(10)
      expect(result.data.items[0]?.id).toBe('task-new')
      expect(result.data.meta.total).toBe(11)
      expect(result.data.meta.hasNextPage).toBe(true)
    }
  })

  it('инвалидирует при другой сортировке или не первой странице', () => {
    const created = createTask({ id: 'task-new' })

    const byTitle = applyTaskCreated(
      createList([]),
      { ...defaultQuery, sortBy: TASK_SORT_BY.Title },
      created,
    )
    const secondPage = applyTaskCreated(
      createList([]),
      { ...defaultQuery, page: 2 },
      created,
    )

    expect(byTitle.type).toBe('invalidate')
    expect(secondPage.type).toBe('invalidate')
  })

  it('игнорирует задачу, не соответствующую фильтрам', () => {
    const created = createTask({ id: 'task-new' })
    const query: TaskListQuery = { ...defaultQuery, status: TASK_STATUS.DONE }

    const result = applyTaskCreated(createList([]), query, created)

    expect(result.type).toBe('none')
  })
})

describe('applyTaskDeleted', () => {
  it('удаляет задачу и обновляет total', () => {
    const task = createTask()
    const data = createList([task])

    const result = applyTaskDeleted(data, {
      id: task.id,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.items).toHaveLength(0)
      expect(result.data.meta.total).toBe(0)
      expect(result.data.meta.totalPages).toBe(0)
    }
  })

  it('безопасен, если задачи уже нет', () => {
    const data = createList([createTask()])

    const result = applyTaskDeleted(data, {
      id: 'already-deleted',
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('none')
  })

  it('инвалидирует, если страница может стать неполной', () => {
    const task = createTask()
    const data = createList([task], {
      total: 15,
      totalPages: 2,
      hasNextPage: true,
    })

    const result = applyTaskDeleted(data, {
      id: task.id,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('invalidate')
  })

  it('не допускает отрицательного total', () => {
    const task = createTask()
    const data = createList([task], { total: 0 })

    const result = applyTaskDeleted(data, {
      id: task.id,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('update')

    if (result.type === 'update') {
      expect(result.data.meta.total).toBe(0)
    }
  })
})
