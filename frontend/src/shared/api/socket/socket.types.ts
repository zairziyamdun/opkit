export interface TaskStatusChangedPayload {
  readonly id: string
  readonly status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  readonly timestamp: string
}

export interface TaskDeletedPayload {
  readonly id: string
  readonly timestamp: string
}

export interface SocketAuth {
  readonly token?: string
}
