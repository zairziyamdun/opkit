export const TASK_SOCKET_EVENTS = {
  CREATED: 'task.created',
  UPDATED: 'task.updated',
  DELETED: 'task.deleted',
  STATUS_CHANGED: 'task.status.changed',
} as const

export type TaskSocketEvent =
  (typeof TASK_SOCKET_EVENTS)[keyof typeof TASK_SOCKET_EVENTS]
