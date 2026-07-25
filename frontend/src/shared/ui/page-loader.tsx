import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function PageLoader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex min-h-[40vh] items-center justify-center', className)}
      {...props}
    >
      <div
        className="size-6 animate-spin rounded-full border-2 border-foreground border-r-transparent"
        aria-label="Загрузка"
      />
    </div>
  )
}
