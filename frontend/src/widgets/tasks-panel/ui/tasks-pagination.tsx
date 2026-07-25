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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Страница {meta.page} из {meta.totalPages} · всего {meta.total}
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
