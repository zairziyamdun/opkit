export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastConfig {
  readonly duration?: number
  readonly progressBar?: boolean
}

export interface ToastItem {
  readonly id: string
  readonly variant: ToastVariant
  readonly message: string
  readonly title?: string
  readonly duration: number
  readonly progressBar: boolean
}

export interface ToastApi {
  success: (message: string, title?: string, config?: ToastConfig) => string
  error: (message: string, title?: string, config?: ToastConfig) => string
  warning: (message: string, title?: string, config?: ToastConfig) => string
  info: (message: string, title?: string, config?: ToastConfig) => string
  dismiss: (id: string) => void
  clear: () => void
}
