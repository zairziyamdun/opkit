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
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-h2 font-semibold tracking-tight text-foreground">
            Задачи
          </h1>
          {isFetching && !isPending ? <Spinner className="text-sm" /> : null}
        </div>
        <CreateTaskButton />
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
              : 'У вас пока нет задач. Создайте первую задачу.'}
          </Alert>
        ) : (
          <div className="space-y-6">
            <KanbanBoard
              tasks={data.items}
              onTaskDeleted={handleTaskDeleted}
            />
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
