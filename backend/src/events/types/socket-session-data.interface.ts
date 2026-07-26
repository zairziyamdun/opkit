import { DefaultEventsMap, Socket } from 'socket.io';

export interface SocketSessionData {
  readonly userId: string;
}

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketSessionData
>;
