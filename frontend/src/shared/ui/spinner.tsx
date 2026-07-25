import { cn } from '@/shared/lib/cn'

interface SpinnerProps {
  readonly className?: string
  readonly label?: string
}

export function Spinner({ className, label = 'Загрузка...' }: SpinnerProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-foreground border-r-transparent"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
