import { useSyncExternalStore } from 'react'

const ACCESS_TOKEN_STORAGE_KEY = 'opkit_access_token'

const listeners = new Set<() => void>()
let accessToken: string | null = null

function emitAccessTokenChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeAccessToken(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
  // Удаляем устаревший localStorage-токен после перехода на memory + refresh cookie.
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  emitAccessTokenChange()
}

export function clearAccessToken(): void {
  accessToken = null
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  emitAccessTokenChange()
}

export function useAccessToken(): string | null {
  return useSyncExternalStore(
    subscribeAccessToken,
    getAccessToken,
    () => null,
  )
}
