import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  applyOptimisticStatusToList,
  findTaskStatusInLists,
  taskQueryKeys,
  updateTaskRequest,
  type PaginatedTasks,
  type Task,
  type TaskListQuery,
  type TaskStatus,
} from '@/entities/task'

interface ChangeTaskStatusVariables {
  readonly id: string
  readonly status: TaskStatus
}

interface ChangeTaskStatusContext {
  readonly previousQueries: ReadonlyArray<
    readonly [readonly unknown[], PaginatedTasks | undefined]
  >
  readonly optimisticStatus: TaskStatus
  readonly optimisticUpdatedAt: string
}

function getListQuery(queryKey: readonly unknown[]): TaskListQuery | null {
  const params = queryKey[2]

  if (typeof params !== 'object' || params === null) {
    return null
  }

  return params as TaskListQuery
}

function syncTaskInLists(
  data: PaginatedTasks | undefined,
  query: TaskListQuery,
  task: Task,
): PaginatedTasks | undefined {
  if (!data) {
    return data
  }

  const exists = data.items.some((item) => item.id === task.id)

  if (!exists) {
    return data
  }

  return applyOptimisticStatusToList(
    data,
    query,
    task.id,
    task.status,
    task.updatedAt,
  )
}

export function useChangeTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: ChangeTaskStatusVariables) =>
      updateTaskRequest(id, { status }),

    onMutate: async ({
      id,
      status,
    }): Promise<ChangeTaskStatusContext> => {
      await queryClient.cancelQueries({ queryKey: taskQueryKeys.lists() })

      const previousQueries = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskQueryKeys.lists(),
      })

      const optimisticUpdatedAt = new Date().toISOString()

      for (const [queryKey, data] of previousQueries) {
        if (!data) {
          continue
        }

        const query = getListQuery(queryKey)

        if (!query) {
          continue
        }

        queryClient.setQueryData<PaginatedTasks>(
          queryKey,
          applyOptimisticStatusToList(
            data,
            query,
            id,
            status,
            optimisticUpdatedAt,
          ),
        )
      }

      return {
        previousQueries,
        optimisticStatus: status,
        optimisticUpdatedAt,
      }
    },

    onError: (_error, variables, context) => {
      if (!context) {
        return
      }

      const currentEntries = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskQueryKeys.lists(),
      })
      const currentStatus = findTaskStatusInLists(currentEntries, variables.id)

      // Более новый drag уже перезаписал статус — не откатываем его snapshot'ом.
      if (
        currentStatus !== null &&
        currentStatus !== context.optimisticStatus
      ) {
        return
      }

      for (const [queryKey, data] of context.previousQueries) {
        queryClient.setQueryData(queryKey, data)
      }
    },

    onSuccess: (task) => {
      // Точечная синхронизация ответа сервера без invalidate / refetch.
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

        queryClient.setQueryData<PaginatedTasks>(
          queryKey,
          syncTaskInLists(data, query, task),
        )
      }
    },
  })
}
