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
        'rounded-card border px-4 py-3 text-small',
        variant === 'destructive'
          ? 'border-destructive/20 bg-destructive/5 text-destructive'
          : 'border-border bg-muted text-foreground-body',
        className,
      )}
      {...props}
    />
  )
}
