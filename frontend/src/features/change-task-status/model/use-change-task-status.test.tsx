import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SORT_ORDER,
  TASK_PRIORITY,
  TASK_SORT_BY,
  TASK_STATUS,
  applyTaskStatusChanged,
  applyTaskUpdated,
  taskQueryKeys,
  type PaginatedTasks,
  type Task,
  type TaskListQuery,
} from '@/entities/task'

const updateTaskRequest = vi.fn()

vi.mock('@/entities/task', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/task')>()

  return {
    ...actual,
    updateTaskRequest: (...args: unknown[]) =>
      updateTaskRequest(...args) as ReturnType<typeof actual.updateTaskRequest>,
  }
})

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

const listQuery: TaskListQuery = {
  page: 1,
  limit: 10,
  sortBy: TASK_SORT_BY.CreatedAt,
  sortOrder: SORT_ORDER.Desc,
}

function createList(items: readonly Task[]): PaginatedTasks {
  return {
    items,
    meta: {
      page: 1,
      limit: 10,
      total: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

describe('useChangeTaskStatusMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    updateTaskRequest.mockReset()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  function wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it('optimistic update сразу меняет cache до ответа сервера', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createList([task]))

    let resolveRequest: (value: Task) => void = () => undefined
    updateTaskRequest.mockImplementation(
      () =>
        new Promise<Task>((resolve) => {
          resolveRequest = resolve
        }),
    )

    const { useChangeTaskStatusMutation } = await import(
      './use-change-task-status'
    )
    const { result } = renderHook(() => useChangeTaskStatusMutation(), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ id: task.id, status: TASK_STATUS.DONE })
    })

    await waitFor(() => {
      const data = queryClient.getQueryData<PaginatedTasks>(
        taskQueryKeys.list(listQuery),
      )
      expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
    })

    act(() => {
      resolveRequest(
        createTask({
          status: TASK_STATUS.DONE,
          updatedAt: '2026-07-25T12:00:00.000Z',
        }),
      )
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('rollback восстанавливает cache при ошибке', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createList([task]))
    updateTaskRequest.mockRejectedValue(new Error('network'))

    const { useChangeTaskStatusMutation } = await import(
      './use-change-task-status'
    )
    const { result } = renderHook(() => useChangeTaskStatusMutation(), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ id: task.id, status: TASK_STATUS.DONE })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    const data = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )
    expect(data?.items[0]?.status).toBe(TASK_STATUS.TODO)
  })

  it('success не создаёт дубликатов задачи', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createList([task]))
    updateTaskRequest.mockResolvedValue(
      createTask({
        status: TASK_STATUS.DONE,
        updatedAt: '2026-07-25T12:00:00.000Z',
      }),
    )

    const { useChangeTaskStatusMutation } = await import(
      './use-change-task-status'
    )
    const { result } = renderHook(() => useChangeTaskStatusMutation(), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ id: task.id, status: TASK_STATUS.DONE })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const data = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )
    expect(data?.items).toHaveLength(1)
    expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
  })

  it('собственный WebSocket с тем же статусом не вызывает повторного обновления', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createList([task]))
    updateTaskRequest.mockResolvedValue(
      createTask({
        status: TASK_STATUS.DONE,
        updatedAt: '2026-07-25T12:00:00.000Z',
      }),
    )

    const { useChangeTaskStatusMutation } = await import(
      './use-change-task-status'
    )
    const { result } = renderHook(() => useChangeTaskStatusMutation(), {
      wrapper,
    })

    act(() => {
      result.current.mutate({ id: task.id, status: TASK_STATUS.DONE })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const afterMutation = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )
    const itemsBeforeWs = afterMutation?.items

    const wsResult = applyTaskStatusChanged(afterMutation!, listQuery, {
      id: task.id,
      status: TASK_STATUS.DONE,
      timestamp: '2026-07-25T12:00:00.000Z',
    })

    expect(wsResult.type).toBe('none')

    const updatedEcho = applyTaskUpdated(
      afterMutation!,
      listQuery,
      createTask({
        status: TASK_STATUS.DONE,
        updatedAt: '2026-07-25T12:00:00.000Z',
      }),
    )

    // Может обновить updatedAt in-place, но не invalidate и не плодить items
    if (updatedEcho.type === 'update') {
      expect(updatedEcho.data.items).toHaveLength(1)
    } else {
      expect(updatedEcho.type).toBe('none')
    }

    expect(itemsBeforeWs).toHaveLength(1)
  })

  it('два быстрых drag подряд: ошибка первого не откатывает второй', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createList([task]))

    let rejectFirst: (error: Error) => void = () => undefined
    let resolveSecond: (value: Task) => void = () => undefined
    let call = 0

    updateTaskRequest.mockImplementation(() => {
      call += 1

      if (call === 1) {
        return new Promise<Task>((_resolve, reject) => {
          rejectFirst = reject
        })
      }

      return new Promise<Task>((resolve) => {
        resolveSecond = resolve
      })
    })

    const { useChangeTaskStatusMutation } = await import(
      './use-change-task-status'
    )
    const { result } = renderHook(() => useChangeTaskStatusMutation(), {
      wrapper,
    })

    act(() => {
      result.current.mutate({
        id: task.id,
        status: TASK_STATUS.IN_PROGRESS,
      })
    })

    await waitFor(() => {
      const data = queryClient.getQueryData<PaginatedTasks>(
        taskQueryKeys.list(listQuery),
      )
      expect(data?.items[0]?.status).toBe(TASK_STATUS.IN_PROGRESS)
    })

    act(() => {
      result.current.mutate({ id: task.id, status: TASK_STATUS.DONE })
    })

    await waitFor(() => {
      const data = queryClient.getQueryData<PaginatedTasks>(
        taskQueryKeys.list(listQuery),
      )
      expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
    })

    act(() => {
      rejectFirst(new Error('stale request failed'))
    })

    await waitFor(() => {
      // Первый rollback не должен вернуть TODO/IN_PROGRESS поверх DONE
      const data = queryClient.getQueryData<PaginatedTasks>(
        taskQueryKeys.list(listQuery),
      )
      expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
    })

    act(() => {
      resolveSecond(
        createTask({
          status: TASK_STATUS.DONE,
          updatedAt: '2026-07-25T12:30:00.000Z',
        }),
      )
    })

    await waitFor(() => {
      const data = queryClient.getQueryData<PaginatedTasks>(
        taskQueryKeys.list(listQuery),
      )
      expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
      expect(data?.items).toHaveLength(1)
    })
  })

  it('устаревший WS после optimistic не возвращает карточку назад', () => {
    const optimistic = createTask({
      status: TASK_STATUS.DONE,
      updatedAt: '2026-07-25T12:00:00.000Z',
    })
    const data = createList([optimistic])

    const result = applyTaskStatusChanged(data, listQuery, {
      id: optimistic.id,
      status: TASK_STATUS.IN_PROGRESS,
      timestamp: '2026-07-25T11:00:00.000Z',
    })

    expect(result.type).toBe('none')
  })
})
