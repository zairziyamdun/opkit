import { useTasks } from '@/entities/task'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, PageLoader, Spinner } from '@/shared/ui'
import { useTaskListFilters } from '../model/use-task-list-filters'
import { TaskList } from './task-list'
import { TasksFilters } from './tasks-filters'
import { TasksPagination } from './tasks-pagination'

export function TasksPanel() {
  const filters = useTaskListFilters()
  const { data, isPending, isError, error, isFetching, refetch } = useTasks(
    filters.query,
  )

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Задачи</h1>
        {isFetching && !isPending ? <Spinner className="text-sm" /> : null}
      </div>

      <TasksFilters filters={filters} />

      {isPending ? <PageLoader /> : null}

      {isError ? (
        <div className="space-y-4">
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
          <Alert>
            {filters.hasActiveFilters
              ? 'По заданным условиям ничего не найдено. Измените фильтры или поиск.'
              : 'У вас пока нет задач.'}
          </Alert>
        ) : (
          <div className="space-y-6">
            <TaskList tasks={data.items} />
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
