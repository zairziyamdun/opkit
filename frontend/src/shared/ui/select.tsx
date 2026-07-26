import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface SelectOption {
  readonly value: string
  readonly label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly options: readonly SelectOption[]
  readonly hasError?: boolean
}

export function Select({
  className,
  options,
  hasError = false,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-input border bg-card px-3 py-2 text-small text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-destructive' : 'border-border-hover',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
