import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  applyOptimisticReorderToList,
  findTaskStatusInLists,
  reorderTaskRequest,
  taskQueryKeys,
  type PaginatedTasks,
  type Task,
  type TaskListQuery,
  type TaskStatus,
} from '@/entities/task'

interface ReorderTaskVariables {
  readonly id: string
  readonly status: TaskStatus
  readonly position: number
}

interface ReorderTaskContext {
  readonly previousQueries: ReadonlyArray<
    readonly [readonly unknown[], PaginatedTasks | undefined]
  >
  readonly optimisticStatus: TaskStatus
  readonly optimisticPosition: number
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

  return applyOptimisticReorderToList(
    data,
    query,
    task.id,
    task.status,
    task.position,
    task.updatedAt,
  )
}

export function useReorderTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, position }: ReorderTaskVariables) =>
      reorderTaskRequest(id, { status, position }),

    onMutate: async ({
      id,
      status,
      position,
    }): Promise<ReorderTaskContext> => {
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
          applyOptimisticReorderToList(
            data,
            query,
            id,
            status,
            position,
            optimisticUpdatedAt,
          ),
        )
      }

      return {
        previousQueries,
        optimisticStatus: status,
        optimisticPosition: position,
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
      const currentTask = currentEntries
        .flatMap(([, data]) => data?.items ?? [])
        .find((task) => task.id === variables.id)

      if (
        currentStatus !== null &&
        currentTask &&
        (currentStatus !== context.optimisticStatus ||
          currentTask.position !== context.optimisticPosition)
      ) {
        return
      }

      for (const [queryKey, data] of context.previousQueries) {
        queryClient.setQueryData(queryKey, data)
      }
    },

    onSuccess: (task) => {
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
