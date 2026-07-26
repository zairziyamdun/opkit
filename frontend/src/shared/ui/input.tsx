import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly hasError?: boolean
}

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-input border bg-card px-3 py-2 text-small text-foreground outline-none transition-colors placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-destructive' : 'border-border-hover',
        className,
      )}
      {...props}
    />
  )
}
