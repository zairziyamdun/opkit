import { Search, X } from 'lucide-react'
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
    <div className="rounded-xl border border-border bg-card px-3 py-3 shadow-card sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="tasks-search" className="text-caption text-muted-foreground">
            Поиск
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-placeholder"
              aria-hidden
            />
            <Input
              id="tasks-search"
              type="search"
              className="h-9 pl-9"
              placeholder="Поиск задач"
              value={filters.searchInput}
              onChange={(event) => filters.onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="grid flex-[2] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="tasks-status"
              className="text-caption text-muted-foreground"
            >
              Статус
            </Label>
            <Select
              id="tasks-status"
              className="h-9"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(event) =>
                filters.onStatusChange(event.target.value as TaskStatus | '')
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="tasks-priority"
              className="text-caption text-muted-foreground"
            >
              Приоритет
            </Label>
            <Select
              id="tasks-priority"
              className="h-9"
              options={PRIORITY_OPTIONS}
              value={filters.priority}
              onChange={(event) =>
                filters.onPriorityChange(event.target.value as TaskPriority | '')
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="tasks-sort-by"
              className="text-caption text-muted-foreground"
            >
              Сортировка
            </Label>
            <Select
              id="tasks-sort-by"
              className="h-9"
              options={SORT_BY_OPTIONS}
              value={filters.sortBy}
              onChange={(event) =>
                filters.onSortByChange(event.target.value as TaskSortBy)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="tasks-sort-order"
              className="text-caption text-muted-foreground"
            >
              Порядок
            </Label>
            <Select
              id="tasks-sort-order"
              className="h-9"
              options={SORT_ORDER_OPTIONS}
              value={filters.sortOrder}
              onChange={(event) =>
                filters.onSortOrderChange(event.target.value as SortOrder)
              }
            />
          </div>
        </div>

        {filters.hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 self-end"
            onClick={filters.reset}
          >
            <X className="size-3.5" aria-hidden />
            Сбросить
          </Button>
        ) : null}
      </div>
    </div>
  )
}
