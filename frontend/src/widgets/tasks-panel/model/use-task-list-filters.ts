import { useMemo, useState } from 'react'
import {
  SORT_ORDER,
  TASK_SORT_BY,
  type SortOrder,
  type TaskListQuery,
  type TaskPriority,
  type TaskSortBy,
  type TaskStatus,
} from '@/entities/task'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'

const DEFAULT_LIMIT = 6
const FIRST_PAGE = 1

export function useTaskListFilters() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 400)
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [sortBy, setSortBy] = useState<TaskSortBy>(TASK_SORT_BY.CreatedAt)
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.Desc)
  const [page, setPage] = useState(FIRST_PAGE)

  function onSearchChange(value: string): void {
    setSearchInput(value)
    setPage(FIRST_PAGE)
  }

  function onStatusChange(value: TaskStatus | ''): void {
    setStatus(value)
    setPage(FIRST_PAGE)
  }

  function onPriorityChange(value: TaskPriority | ''): void {
    setPriority(value)
    setPage(FIRST_PAGE)
  }

  function onSortByChange(value: TaskSortBy): void {
    setSortBy(value)
    setPage(FIRST_PAGE)
  }

  function onSortOrderChange(value: SortOrder): void {
    setSortOrder(value)
    setPage(FIRST_PAGE)
  }

  const query: TaskListQuery = useMemo(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      sortBy,
      sortOrder,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    }),
    [page, sortBy, sortOrder, debouncedSearch, status, priority],
  )

  const hasActiveFilters = Boolean(debouncedSearch || status || priority)

  function reset(): void {
    setSearchInput('')
    setStatus('')
    setPriority('')
    setSortBy(TASK_SORT_BY.CreatedAt)
    setSortOrder(SORT_ORDER.Desc)
    setPage(FIRST_PAGE)
  }

  return {
    searchInput,
    status,
    priority,
    sortBy,
    sortOrder,
    page,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onSortByChange,
    onSortOrderChange,
    setPage,
    query,
    hasActiveFilters,
    reset,
  }
}

export type TaskListFilters = ReturnType<typeof useTaskListFilters>
