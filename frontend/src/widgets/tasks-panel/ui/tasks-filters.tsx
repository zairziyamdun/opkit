import {
  SORT_ORDER,
  TASK_PRIORITY_OPTIONS,
  TASK_SORT_BY,
  TASK_STATUS_OPTIONS,
  type SortOrder,
  type TaskPriority,
  type TaskSortBy,
  type TaskStatus,
} from '@/entities/task'
import { Button, Input, Label, Select, type SelectOption } from '@/shared/ui'
import type { TaskListFilters } from '../model/use-task-list-filters'

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Все статусы' },
  ...TASK_STATUS_OPTIONS,
]

const PRIORITY_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Все приоритеты' },
  ...TASK_PRIORITY_OPTIONS,
]

const SORT_BY_OPTIONS: readonly SelectOption[] = [
  { value: TASK_SORT_BY.CreatedAt, label: 'По дате создания' },
  { value: TASK_SORT_BY.UpdatedAt, label: 'По дате обновления' },
  { value: TASK_SORT_BY.Title, label: 'По названию' },
  { value: TASK_SORT_BY.Priority, label: 'По приоритету' },
  { value: TASK_SORT_BY.Status, label: 'По статусу' },
]

const SORT_ORDER_OPTIONS: readonly SelectOption[] = [
  { value: SORT_ORDER.Desc, label: 'По убыванию' },
  { value: SORT_ORDER.Asc, label: 'По возрастанию' },
]

export function TasksFilters({ filters }: { readonly filters: TaskListFilters }) {
  return (
    <div className="space-y-4 rounded-card border border-border bg-card p-4 shadow-card">
      <div className="space-y-2">
        <Label htmlFor="tasks-search">Поиск</Label>
        <Input
          id="tasks-search"
          type="search"
          placeholder="Название или описание"
          value={filters.searchInput}
          onChange={(event) => filters.onSearchChange(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="tasks-status">Статус</Label>
          <Select
            id="tasks-status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) =>
              filters.onStatusChange(event.target.value as TaskStatus | '')
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tasks-priority">Приоритет</Label>
          <Select
            id="tasks-priority"
            options={PRIORITY_OPTIONS}
            value={filters.priority}
            onChange={(event) =>
              filters.onPriorityChange(event.target.value as TaskPriority | '')
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tasks-sort-by">Сортировка</Label>
          <Select
            id="tasks-sort-by"
            options={SORT_BY_OPTIONS}
            value={filters.sortBy}
            onChange={(event) =>
              filters.onSortByChange(event.target.value as TaskSortBy)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tasks-sort-order">Порядок</Label>
          <Select
            id="tasks-sort-order"
            options={SORT_ORDER_OPTIONS}
            value={filters.sortOrder}
            onChange={(event) =>
              filters.onSortOrderChange(event.target.value as SortOrder)
            }
          />
        </div>
      </div>

      {filters.hasActiveFilters ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={filters.reset}>
            Сбросить фильтры
          </Button>
        </div>
      ) : null}
    </div>
  )
}
