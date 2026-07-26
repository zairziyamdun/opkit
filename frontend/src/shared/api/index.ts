export { apiClient } from './api-client'
export { getErrorMessage, isApiError, toApiError } from './error'
export {
  TASK_SOCKET_EVENTS,
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  socket,
  useSocketEvent,
} from './socket'
export type {
  SocketAuth,
  TaskDeletedPayload,
  TaskSocketEvent,
  TaskStatusChangedPayload,
} from './socket'
