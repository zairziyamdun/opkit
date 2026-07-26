import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  TASK_SOCKET_EVENTS,
  useSocketEvent,
  type TaskDeletedPayload,
  type TaskStatusChangedPayload,
} from '@/shared/api/socket'
import {
  applyTaskCreated,
  applyTaskDeleted,
  applyTaskStatusChanged,
  applyTaskUpdated,
  type TaskListCacheResult,
} from '../lib/task-realtime-cache'
import { taskQueryKeys } from './query-keys'
import type {
  PaginatedTasks,
  TaskCreatedPayload,
  TaskListQuery,
  TaskUpdatedPayload,
} from './types'

function getListQuery(queryKey: readonly unknown[]): TaskListQuery | null {
  const params = queryKey[2]

  if (typeof params !== 'object' || params === null) {
    return null
  }

  return params as TaskListQuery
}

type TaskListUpdater = (
  data: PaginatedTasks,
  query: TaskListQuery,
) => TaskListCacheResult

export function useTaskRealtime(enabled = true): void {
  const queryClient = useQueryClient()

  const applyToTaskLists = useCallback(
    (updater: TaskListUpdater): void => {
      const entries = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskQueryKeys.lists(),
      })

      for (const [queryKey, data] of entries) {
        if (!data) {
          continue
        }

        const query = getListQuery(queryKey)

        if (!query) {
          continue
        }

        try {
          const result = updater(data, query)

          if (result.type === 'update') {
            queryClient.setQueryData(queryKey, result.data)
          } else if (result.type === 'invalidate') {
            void queryClient.invalidateQueries({ queryKey, exact: true })
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[task-realtime] cache update failed', error)
          }
        }
      }
    },
    [queryClient],
  )

  useSocketEvent<TaskCreatedPayload>(
    TASK_SOCKET_EVENTS.CREATED,
    (payload) => {
      applyToTaskLists((data, query) => applyTaskCreated(data, query, payload))
    },
    enabled,
  )

  useSocketEvent<TaskUpdatedPayload>(
    TASK_SOCKET_EVENTS.UPDATED,
    (payload) => {
      applyToTaskLists((data, query) => applyTaskUpdated(data, query, payload))
    },
    enabled,
  )

  useSocketEvent<TaskStatusChangedPayload>(
    TASK_SOCKET_EVENTS.STATUS_CHANGED,
    (payload) => {
      applyToTaskLists((data, query) =>
        applyTaskStatusChanged(data, query, payload),
      )
    },
    enabled,
  )

  useSocketEvent<TaskDeletedPayload>(
    TASK_SOCKET_EVENTS.DELETED,
    (payload) => {
      applyToTaskLists((data) => applyTaskDeleted(data, payload))
    },
    enabled,
  )
}
