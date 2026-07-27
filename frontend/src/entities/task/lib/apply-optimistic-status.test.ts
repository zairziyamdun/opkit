import { describe, expect, it } from 'vitest'
import {
  SORT_ORDER,
  TASK_PRIORITY,
  TASK_SORT_BY,
  TASK_STATUS,
  type PaginatedTasks,
  type Task,
  type TaskListQuery,
} from '../model/types'
import {
  applyOptimisticStatusToList,
  findTaskStatusInLists,
} from './apply-optimistic-status'

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Report',
    description: 'Quarterly report',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    position: 0,
    userId: 'user-1',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-07-25T10:00:00.000Z',
    ...overrides,
  }
}

function createList(items: readonly Task[]): PaginatedTasks {
  return {
    items,
    meta: {
      page: 1,
      limit: 10,
      total: items.length,
      totalPages: items.length === 0 ? 0 : 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

const defaultQuery: TaskListQuery = {
  page: 1,
  limit: 10,
  sortBy: TASK_SORT_BY.CreatedAt,
  sortOrder: SORT_ORDER.Desc,
}

describe('applyOptimisticStatusToList', () => {
  it('сразу меняет статус и updatedAt', () => {
    const data = createList([createTask()])
    const updatedAt = '2026-07-25T12:00:00.000Z'

    const next = applyOptimisticStatusToList(
      data,
      defaultQuery,
      'task-1',
      TASK_STATUS.DONE,
      updatedAt,
    )

    expect(next.items[0]?.status).toBe(TASK_STATUS.DONE)
    expect(next.items[0]?.updatedAt).toBe(updatedAt)
    expect(next.items).not.toBe(data.items)
  })

  it('удаляет задачу из списка со status-фильтром', () => {
    const data = createList([createTask()])
    const query: TaskListQuery = { ...defaultQuery, status: TASK_STATUS.TODO }

    const next = applyOptimisticStatusToList(
      data,
      query,
      'task-1',
      TASK_STATUS.DONE,
      '2026-07-25T12:00:00.000Z',
    )

    expect(next.items).toHaveLength(0)
    expect(next.meta.total).toBe(0)
  })

  it('идемпотентен при повторном применении того же статуса', () => {
    const data = createList([
      createTask({
        status: TASK_STATUS.DONE,
        updatedAt: '2026-07-25T12:00:00.000Z',
      }),
    ])

    const next = applyOptimisticStatusToList(
      data,
      defaultQuery,
      'task-1',
      TASK_STATUS.DONE,
      '2026-07-25T11:00:00.000Z',
    )

    expect(next).toBe(data)
  })
})

describe('findTaskStatusInLists', () => {
  it('находит текущий статус задачи в cache entries', () => {
    const entries: ReadonlyArray<
      readonly [readonly unknown[], PaginatedTasks | undefined]
    > = [
      [['task', 'list', defaultQuery], createList([createTask({ status: TASK_STATUS.IN_PROGRESS })])],
    ]

    expect(findTaskStatusInLists(entries, 'task-1')).toBe(
      TASK_STATUS.IN_PROGRESS,
    )
    expect(findTaskStatusInLists(entries, 'missing')).toBeNull()
  })
})
