export {
  attachSocketDiagnostics,
  connectSocket,
  disconnectSocket,
  socket,
} from './socket-client'
export { TASK_SOCKET_EVENTS } from './socket-events'
export type {
  SocketAuth,
  TaskDeletedPayload,
  TaskStatusChangedPayload,
} from './socket.types'
export { useSocketEvent } from './use-socket-event'
