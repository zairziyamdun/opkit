import { apiClient } from '@/shared/api'
import type {
  CreateTaskPayload,
  PaginatedTasks,
  Task,
  TaskListQuery,
  UpdateTaskPayload,
} from '@/entities/task/model/types'

export async function getTasksRequest(
  query: TaskListQuery,
): Promise<PaginatedTasks> {
  const { data } = await apiClient.get<PaginatedTasks>('/tasks', {
    params: query,
  })
  return data
}

export async function createTaskRequest(
  payload: CreateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.post<Task>('/tasks', payload)
  return data
}

export async function updateTaskRequest(
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}`, payload)
  return data
}

export async function deleteTaskRequest(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}
