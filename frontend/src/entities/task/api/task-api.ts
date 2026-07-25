import { apiClient } from '@/shared/api'
import type { PaginatedTasks, TaskListQuery } from '@/entities/task/model/types'

export async function getTasksRequest(
  query: TaskListQuery,
): Promise<PaginatedTasks> {
  const { data } = await apiClient.get<PaginatedTasks>('/tasks', {
    params: query,
  })
  return data
}
