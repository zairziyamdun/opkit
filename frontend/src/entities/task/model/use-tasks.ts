import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getTasksRequest } from '@/entities/task/api/task-api'
import { taskQueryKeys } from '@/entities/task/model/query-keys'
import type { TaskListQuery } from '@/entities/task/model/types'

export function useTasks(query: TaskListQuery) {
  return useQuery({
    queryKey: taskQueryKeys.list(query),
    queryFn: () => getTasksRequest(query),
    placeholderData: keepPreviousData,
  })
}
