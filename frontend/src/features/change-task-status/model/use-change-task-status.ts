import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  taskQueryKeys,
  updateTaskRequest,
  type PaginatedTasks,
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
}

function applyStatusToLists(
  data: PaginatedTasks | undefined,
  id: string,
  status: TaskStatus,
): PaginatedTasks | undefined {
  if (!data) {
    return data
  }

  return {
    ...data,
    items: data.items.map((task) =>
      task.id === id ? { ...task, status } : task,
    ),
  }
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

      queryClient.setQueriesData<PaginatedTasks>(
        { queryKey: taskQueryKeys.lists() },
        (data) => applyStatusToLists(data, id, status),
      )

      return { previousQueries }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      for (const [queryKey, data] of context.previousQueries) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() })
    },
  })
}
