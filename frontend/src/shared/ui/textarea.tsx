import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly hasError?: boolean
}

export function Textarea({
  className,
  hasError = false,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'flex w-full resize-y rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-destructive' : 'border-border',
        className,
      )}
      {...props}
    />
  )
}
