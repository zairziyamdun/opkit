import { AuthenticatedSocket } from '../types/socket-session-data.interface';

const BEARER_PREFIX = 'Bearer ';

export function extractAccessToken(socket: AuthenticatedSocket): string | null {
  const auth = socket.handshake.auth as Record<string, unknown>;

  if (typeof auth.token === 'string' && auth.token.length > 0) {
    return auth.token;
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (
    typeof authorizationHeader === 'string' &&
    authorizationHeader.startsWith(BEARER_PREFIX)
  ) {
    return authorizationHeader.slice(BEARER_PREFIX.length);
  }

  return null;
}
