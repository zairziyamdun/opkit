import { LayoutGrid } from 'lucide-react'
import { useTasks } from '@/entities/task'
import { CreateTaskButton } from '@/features/create-task'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, PageLoader, Spinner } from '@/shared/ui'
import { KanbanBoard } from '@/widgets/kanban-board'
import { useTaskListFilters } from '../model/use-task-list-filters'
import { TasksFilters } from './tasks-filters'
import { TasksPagination } from './tasks-pagination'

export function TasksPanel() {
  const filters = useTaskListFilters()
  const { data, isPending, isError, error, isFetching, refetch } = useTasks(
    filters.query,
  )

  function handleTaskDeleted(): void {
    if (data && data.items.length === 1 && data.meta.hasPreviousPage) {
      filters.setPage(data.meta.page - 1)
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
            <LayoutGrid className="size-3.5" aria-hidden />
            Доска
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-h2 font-semibold tracking-tight text-foreground">
              Задачи
            </h1>
            {data ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-caption font-semibold text-foreground-body tabular-nums">
                {data.meta.total}
              </span>
            ) : null}
            {isFetching && !isPending ? (
              <Spinner className="text-sm" />
            ) : null}
          </div>
        </div>
        <CreateTaskButton />
      </div>

      <TasksFilters filters={filters} />

      {isPending ? <PageLoader /> : null}

      {isError ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <Alert variant="destructive">
            {getErrorMessage(error, 'Не удалось загрузить задачи')}
          </Alert>
          <Button variant="outline" onClick={() => void refetch()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && data ? (
        data.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border-hover bg-muted/40 px-6 py-16 text-center">
            <p className="max-w-md text-small text-muted-foreground">
              {filters.hasActiveFilters
                ? 'По заданным условиям ничего не найдено. Измените фильтры или поиск.'
                : 'На доске пока нет задач. Создайте первую — она появится в колонке «К выполнению».'}
            </p>
            {!filters.hasActiveFilters ? (
              <div className="mt-4">
                <CreateTaskButton />
              </div>
            ) : (
              <Button
                className="mt-4"
                variant="outline"
                size="sm"
                onClick={filters.reset}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-xl bg-board/70 p-3 sm:p-4">
              <KanbanBoard
                tasks={data.items}
                onTaskDeleted={handleTaskDeleted}
              />
            </div>
            <TasksPagination
              meta={data.meta}
              isFetching={isFetching}
              onPageChange={filters.setPage}
            />
          </div>
        )
      ) : null}
    </section>
  )
}
