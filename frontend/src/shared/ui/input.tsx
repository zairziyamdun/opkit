import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly hasError?: boolean
}

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-destructive' : 'border-border',
        className,
      )}
      {...props}
    />
  )
}
