import { useSyncExternalStore } from 'react'
import { ACCESS_TOKEN_KEY } from '@/shared/config/constants'

const listeners = new Set<() => void>()

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
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  emitAccessTokenChange()
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  emitAccessTokenChange()
}

export function useAccessToken(): string | null {
  return useSyncExternalStore(
    subscribeAccessToken,
    getAccessToken,
    () => null,
  )
}
