import type { PaginationMeta } from '@/entities/task'
import { Button } from '@/shared/ui'

interface TasksPaginationProps {
  readonly meta: PaginationMeta
  readonly isFetching: boolean
  readonly onPageChange: (page: number) => void
}

export function TasksPagination({
  meta,
  isFetching,
  onPageChange,
}: TasksPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-card">
      <p className="text-caption text-muted-foreground">
        Страница{' '}
        <span className="font-semibold text-foreground-body tabular-nums">
          {meta.page}
        </span>{' '}
        из{' '}
        <span className="font-semibold text-foreground-body tabular-nums">
          {meta.totalPages}
        </span>
        <span className="mx-2 text-border-hover">·</span>
        Всего{' '}
        <span className="font-semibold text-foreground-body tabular-nums">
          {meta.total}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage || isFetching}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage || isFetching}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Вперёд
        </Button>
      </div>
    </div>
  )
}
