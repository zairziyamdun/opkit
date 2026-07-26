import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const listeners = new Map<string, Set<(payload: unknown) => void>>()

const mockSocket = {
  on: vi.fn((event: string, handler: (payload: unknown) => void) => {
    const set = listeners.get(event) ?? new Set()
    set.add(handler)
    listeners.set(event, set)
  }),
  off: vi.fn((event: string, handler: (payload: unknown) => void) => {
    listeners.get(event)?.delete(handler)
  }),
}

vi.mock('./socket-client', () => ({
  socket: mockSocket,
}))

describe('useSocketEvent', () => {
  beforeEach(() => {
    listeners.clear()
    mockSocket.on.mockClear()
    mockSocket.off.mockClear()
  })

  it('добавляет listener при mount и удаляет тот же handler при unmount', async () => {
    const { useSocketEvent } = await import('./use-socket-event')
    const handler = vi.fn()

    const { unmount } = renderHook(() =>
      useSocketEvent('task.created', handler),
    )

    expect(mockSocket.on).toHaveBeenCalledTimes(1)
    const registeredHandler = mockSocket.on.mock.calls[0]?.[1] as (
      payload: unknown,
    ) => void

    unmount()

    expect(mockSocket.off).toHaveBeenCalledTimes(1)
    expect(mockSocket.off).toHaveBeenCalledWith(
      'task.created',
      registeredHandler,
    )
  })

  it('повторный mount не оставляет дубликаты listeners', async () => {
    const { useSocketEvent } = await import('./use-socket-event')
    const handler = vi.fn()

    const first = renderHook(() => useSocketEvent('task.updated', handler))
    first.unmount()

    const second = renderHook(() => useSocketEvent('task.updated', handler))

    expect(listeners.get('task.updated')?.size).toBe(1)
    second.unmount()
    expect(listeners.get('task.updated')?.size).toBe(0)
  })

  it('не подписывается, когда enabled=false', async () => {
    const { useSocketEvent } = await import('./use-socket-event')

    renderHook(() => useSocketEvent('task.deleted', vi.fn(), false))

    expect(mockSocket.on).not.toHaveBeenCalled()
  })
})
