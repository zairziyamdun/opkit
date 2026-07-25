import type { TaskListQuery } from './types'

export const taskQueryKeys = {
  all: ['task'] as const,
  lists: () => [...taskQueryKeys.all, 'list'] as const,
  list: (query: TaskListQuery) => [...taskQueryKeys.lists(), query] as const,
}
