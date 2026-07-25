import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'destructive'
}

export function Alert({
  className,
  variant = 'default',
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'destructive'
          ? 'border-destructive/30 bg-destructive-foreground text-destructive'
          : 'border-border bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  )
}
