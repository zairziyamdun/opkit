import type {
  ToastApi,
  ToastConfig,
  ToastItem,
  ToastVariant,
} from './types'

const DEFAULT_DURATION_MS = 4000
const MAX_VISIBLE = 4

let toasts: readonly ToastItem[] = []
let nextId = 0
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): readonly ToastItem[] {
  return toasts
}

function dismiss(id: string): void {
  const next = toasts.filter((item) => item.id !== id)
  if (next.length === toasts.length) {
    return
  }
  toasts = next
  emit()
}

function clear(): void {
  if (toasts.length === 0) {
    return
  }
  toasts = []
  emit()
}

function createToast(
  variant: ToastVariant,
  message: string,
  title?: string,
  config: ToastConfig = {},
): string {
  const id = String(++nextId)
  const item: ToastItem = {
    id,
    variant,
    message,
    title,
    duration: config.duration ?? DEFAULT_DURATION_MS,
    progressBar: config.progressBar ?? true,
  }

  toasts = [item, ...toasts].slice(0, MAX_VISIBLE)
  emit()
  return id
}

export const toast: ToastApi = {
  success: (message, title, config) =>
    createToast('success', message, title, config),
  error: (message, title, config) =>
    createToast('error', message, title, config),
  warning: (message, title, config) =>
    createToast('warning', message, title, config),
  info: (message, title, config) => createToast('info', message, title, config),
  dismiss,
  clear,
}

export const toastStore = {
  subscribe,
  getSnapshot,
}
