export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]

export const TASK_SORT_BY = {
  CreatedAt: 'createdAt',
  UpdatedAt: 'updatedAt',
  Title: 'title',
  Priority: 'priority',
  Status: 'status',
  Position: 'position',
} as const

export type TaskSortBy = (typeof TASK_SORT_BY)[keyof typeof TASK_SORT_BY]

export const SORT_ORDER = {
  Asc: 'asc',
  Desc: 'desc',
} as const

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER]

export interface Task {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly status: TaskStatus
  readonly priority: TaskPriority
  readonly position: number
  readonly userId: string
  readonly createdAt: string
  readonly updatedAt: string
}

/** Payload for Socket.IO `task.created` — matches backend TaskResponseDto */
export type TaskCreatedPayload = Task

/** Payload for Socket.IO `task.updated` — matches backend TaskResponseDto */
export type TaskUpdatedPayload = Task


export interface PaginationMeta {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
}

export interface PaginatedTasks {
  readonly items: readonly Task[]
  readonly meta: PaginationMeta
}

export interface CreateTaskPayload {
  readonly title: string
  readonly description?: string
  readonly status?: TaskStatus
  readonly priority?: TaskPriority
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>

export interface ReorderTaskPayload {
  readonly status?: TaskStatus
  readonly position: number
}

export interface TaskListQuery {
  readonly page?: number
  readonly limit?: number
  readonly status?: TaskStatus
  readonly priority?: TaskPriority
  readonly search?: string
  readonly sortBy?: TaskSortBy
  readonly sortOrder?: SortOrder
}
