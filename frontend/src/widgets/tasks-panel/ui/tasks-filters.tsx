import { ArrowUpDown, Search, X } from 'lucide-react'
import {
  SORT_ORDER,
  TASK_PRIORITY_OPTIONS,
  TASK_SORT_BY,
  TASK_STATUS_OPTIONS,
  type TaskPriority,
  type TaskSortBy,
  type TaskStatus,
} from '@/entities/task'
import { Button, Input, Select, type SelectOption } from '@/shared/ui'
import type { TaskListFilters } from '../model/use-task-list-filters'

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Статус' },
  ...TASK_STATUS_OPTIONS,
]

const PRIORITY_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Приоритет' },
  ...TASK_PRIORITY_OPTIONS,
]

const SORT_BY_OPTIONS: readonly SelectOption[] = [
  { value: TASK_SORT_BY.CreatedAt, label: 'По дате создания' },
  { value: TASK_SORT_BY.UpdatedAt, label: 'По дате обновления' },
  { value: TASK_SORT_BY.Title, label: 'По названию' },
  { value: TASK_SORT_BY.Priority, label: 'По приоритету' },
  { value: TASK_SORT_BY.Status, label: 'По статусу' },
]

export function TasksFilters({ filters }: { readonly filters: TaskListFilters }) {
  function toggleSortOrder(): void {
    filters.onSortOrderChange(
      filters.sortOrder === SORT_ORDER.Desc ? SORT_ORDER.Asc : SORT_ORDER.Desc,
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-[400px] min-w-[240px] flex-1 basis-[320px]">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-placeholder"
          aria-hidden
        />
        <Input
          id="tasks-search"
          type="search"
          className="h-9 pl-9"
          placeholder="Поиск задач"
          aria-label="Поиск задач"
          value={filters.searchInput}
          onChange={(event) => filters.onSearchChange(event.target.value)}
        />
      </div>

      <Select
        id="tasks-status"
        className="h-9 w-[180px]"
        aria-label="Статус"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(event) =>
          filters.onStatusChange(event.target.value as TaskStatus | '')
        }
      />

      <Select
        id="tasks-priority"
        className="h-9 w-[180px]"
        aria-label="Приоритет"
        options={PRIORITY_OPTIONS}
        value={filters.priority}
        onChange={(event) =>
          filters.onPriorityChange(event.target.value as TaskPriority | '')
        }
      />

      <Select
        id="tasks-sort-by"
        className="h-9 w-[200px]"
        aria-label="Сортировка"
        options={SORT_BY_OPTIONS}
        value={filters.sortBy}
        onChange={(event) =>
          filters.onSortByChange(event.target.value as TaskSortBy)
        }
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-9 shrink-0 px-0"
        aria-label={
          filters.sortOrder === SORT_ORDER.Desc
            ? 'Порядок: по убыванию. Переключить на возрастание'
            : 'Порядок: по возрастанию. Переключить на убывание'
        }
        title={
          filters.sortOrder === SORT_ORDER.Desc ? 'По убыванию' : 'По возрастанию'
        }
        onClick={toggleSortOrder}
      >
        <ArrowUpDown className="size-4" aria-hidden />
      </Button>

      {filters.hasActiveFilters ? (
        <Button variant="ghost" size="sm" className="h-9" onClick={filters.reset}>
          <X className="size-3.5" aria-hidden />
          Сбросить
        </Button>
      ) : null}
    </div>
  )
}
