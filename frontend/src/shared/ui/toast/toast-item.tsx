import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { toast } from './toast-store'
import type { ToastItem as ToastItemModel, ToastVariant } from './types'

interface ToastItemProps {
  readonly item: ToastItemModel
}

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    readonly icon: typeof CheckCircle2
    readonly accent: string
    readonly iconClass: string
    readonly progress: string
  }
> = {
  success: {
    icon: CheckCircle2,
    accent: 'border-l-success',
    iconClass: 'text-success',
    progress: 'bg-success',
  },
  error: {
    icon: XCircle,
    accent: 'border-l-destructive',
    iconClass: 'text-destructive',
    progress: 'bg-destructive',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'border-l-warning',
    iconClass: 'text-warning',
    progress: 'bg-warning',
  },
  info: {
    icon: Info,
    accent: 'border-l-primary',
    iconClass: 'text-primary',
    progress: 'bg-primary',
  },
}

export function ToastItemView({ item }: ToastItemProps) {
  const styles = VARIANT_STYLES[item.variant]
  const Icon = styles.icon
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const remainingRef = useRef(item.duration)
  const startedAtRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (item.duration <= 0) {
      return
    }

    function tick(now: number): void {
      if (startedAtRef.current === null) {
        startedAtRef.current = now
      }

      const elapsed = now - startedAtRef.current
      const left = Math.max(0, remainingRef.current - elapsed)
      setProgress((left / item.duration) * 100)

      if (left <= 0) {
        toast.dismiss(item.id)
        return
      }

      frameRef.current = window.requestAnimationFrame(tick)
    }

    if (!isPaused) {
      frameRef.current = window.requestAnimationFrame(tick)
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }

      if (startedAtRef.current !== null && !isPaused) {
        const elapsed = performance.now() - startedAtRef.current
        remainingRef.current = Math.max(0, remainingRef.current - elapsed)
        startedAtRef.current = null
      }
    }
  }, [item.duration, item.id, isPaused])

  return (
    <motion.div
      layout
      role="status"
      aria-live={item.variant === 'error' ? 'assertive' : 'polite'}
      initial={{ opacity: 0, x: 24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'pointer-events-auto relative w-[min(100vw-2rem,22rem)] overflow-hidden rounded-card border border-border border-l-4 bg-card shadow-card',
        styles.accent,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex gap-3 p-4 pr-10">
        <Icon
          className={cn('mt-0.5 size-5 shrink-0', styles.iconClass)}
          aria-hidden
        />
        <div className="min-w-0 space-y-0.5">
          {item.title ? (
            <p className="text-small font-semibold text-foreground">
              {item.title}
            </p>
          ) : null}
          <p className="text-small leading-snug text-muted-foreground">
            {item.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Закрыть уведомление"
        className="absolute top-3 right-3 rounded-button p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => toast.dismiss(item.id)}
      >
        <X className="size-4" aria-hidden />
      </button>

      {item.progressBar && item.duration > 0 ? (
        <div className="h-1 w-full bg-muted">
          <div
            className={cn('h-full origin-left', styles.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </motion.div>
  )
}
