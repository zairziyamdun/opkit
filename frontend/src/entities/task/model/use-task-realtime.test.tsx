import { StrictMode, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SORT_ORDER,
  TASK_PRIORITY,
  TASK_SORT_BY,
  TASK_STATUS,
} from './types'
import type { PaginatedTasks, Task, TaskListQuery } from './types'
import { taskQueryKeys } from './query-keys'

type SocketHandler = (payload: unknown) => void

const socketListeners = new Map<string, Set<SocketHandler>>()

const mockSocket = {
  auth: {} as Record<string, unknown>,
  connected: false,
  active: false,
  id: 'socket-test',
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn((event: string, handler: SocketHandler) => {
    const handlers = socketListeners.get(event) ?? new Set<SocketHandler>()
    handlers.add(handler)
    socketListeners.set(event, handlers)
  }),
  off: vi.fn((event: string, handler: SocketHandler) => {
    socketListeners.get(event)?.delete(handler)
  }),
  io: { on: vi.fn() },
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

function emitSocketEvent(event: string, payload: unknown): void {
  const handlers = socketListeners.get(event)

  if (!handlers) {
    return
  }

  for (const handler of handlers) {
    handler(payload)
  }
}

function countListeners(event: string): number {
  return socketListeners.get(event)?.size ?? 0
}

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

function createListData(items: readonly Task[]): PaginatedTasks {
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

describe('useTaskRealtime', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    socketListeners.clear()
    mockSocket.on.mockClear()
    mockSocket.off.mockClear()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  function createWrapper(strictMode = false) {
    return function Wrapper({ children }: { readonly children: ReactNode }) {
      const tree = (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      return strictMode ? <StrictMode>{tree}</StrictMode> : tree
    }
  }

  it('task.status.changed обновляет статус в query cache (Kanban получает новую колонку)', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createListData([task]))

    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(true), { wrapper: createWrapper() })

    act(() => {
      emitSocketEvent('task.status.changed', {
        id: task.id,
        status: TASK_STATUS.DONE,
        timestamp: '2026-07-25T11:00:00.000Z',
      })
    })

    const data = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )

    expect(data?.items[0]?.status).toBe(TASK_STATUS.DONE)
  })

  it('task.deleted удаляет задачу и безопасен при повторе', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createListData([task]))

    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(true), { wrapper: createWrapper() })

    const payload = { id: task.id, timestamp: '2026-07-25T11:00:00.000Z' }

    act(() => {
      emitSocketEvent('task.deleted', payload)
      emitSocketEvent('task.deleted', payload)
    })

    const data = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )

    expect(data?.items).toHaveLength(0)
    expect(data?.meta.total).toBe(0)
  })

  it('task.created не создаёт дубликат', async () => {
    const task = createTask()
    queryClient.setQueryData(taskQueryKeys.list(listQuery), createListData([task]))

    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(true), { wrapper: createWrapper() })

    act(() => {
      emitSocketEvent('task.created', task)
    })

    const data = queryClient.getQueryData<PaginatedTasks>(
      taskQueryKeys.list(listQuery),
    )

    expect(data?.items).toHaveLength(1)
  })

  it('событие для неизвестной задачи не ломает приложение', async () => {
    queryClient.setQueryData(
      taskQueryKeys.list(listQuery),
      createListData([createTask()]),
    )

    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(true), { wrapper: createWrapper() })

    expect(() => {
      act(() => {
        emitSocketEvent('task.updated', createTask({ id: 'ghost' }))
        emitSocketEvent('task.deleted', {
          id: 'ghost',
          timestamp: '2026-07-25T11:00:00.000Z',
        })
      })
    }).not.toThrow()
  })

  it('cleanup удаляет все четыре listener-а', async () => {
    const { useTaskRealtime } = await import('./use-task-realtime')

    const { unmount } = renderHook(() => useTaskRealtime(true), {
      wrapper: createWrapper(),
    })

    expect(countListeners('task.created')).toBe(1)
    expect(countListeners('task.updated')).toBe(1)
    expect(countListeners('task.deleted')).toBe(1)
    expect(countListeners('task.status.changed')).toBe(1)

    unmount()

    expect(countListeners('task.created')).toBe(0)
    expect(countListeners('task.updated')).toBe(0)
    expect(countListeners('task.deleted')).toBe(0)
    expect(countListeners('task.status.changed')).toBe(0)
  })

  it('StrictMode не оставляет двойных listeners', async () => {
    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(true), {
      wrapper: createWrapper(true),
    })

    expect(countListeners('task.created')).toBe(1)
    expect(countListeners('task.updated')).toBe(1)
    expect(countListeners('task.deleted')).toBe(1)
    expect(countListeners('task.status.changed')).toBe(1)
  })

  it('не подписывается, когда enabled=false', async () => {
    const { useTaskRealtime } = await import('./use-task-realtime')

    renderHook(() => useTaskRealtime(false), { wrapper: createWrapper() })

    expect(countListeners('task.created')).toBe(0)
    expect(countListeners('task.status.changed')).toBe(0)
  })
})
