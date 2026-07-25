import type { TaskFormValues } from '@/entities/task/model/task-form-schema'
import type {
  CreateTaskPayload,
  Task,
  UpdateTaskPayload,
} from '@/entities/task/model/types'

export function toTaskFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
  }
}

export function toCreateTaskPayload(values: TaskFormValues): CreateTaskPayload {
  return {
    title: values.title,
    status: values.status,
    priority: values.priority,
    ...(values.description ? { description: values.description } : {}),
  }
}

export function toUpdateTaskPayload(values: TaskFormValues): UpdateTaskPayload {
  return {
    title: values.title,
    status: values.status,
    priority: values.priority,
    description: values.description,
  }
}
