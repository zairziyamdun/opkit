import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  TASK_STATUS,
  type Task,
  type TaskStatus,
} from '@/entities/task'
import { useChangeTaskStatusMutation } from '@/features/change-task-status'
import { getErrorMessage } from '@/shared/api'
import { Alert } from '@/shared/ui'
import {
  KANBAN_COLUMN_ORDER,
  groupTasksByStatus,
} from '../lib/group-tasks-by-status'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'

interface KanbanBoardProps {
  readonly tasks: readonly Task[]
  readonly onTaskDeleted?: () => void
}

function isTaskStatus(value: string): value is TaskStatus {
  return (
    value === TASK_STATUS.TODO ||
    value === TASK_STATUS.IN_PROGRESS ||
    value === TASK_STATUS.DONE
  )
}

function resolveTargetStatus(
  overId: string | number,
  tasksById: ReadonlyMap<string, Task>,
): TaskStatus | null {
  const id = String(overId)

  if (isTaskStatus(id)) {
    return id
  }

  return tasksById.get(id)?.status ?? null
}

export function KanbanBoard({ tasks, onTaskDeleted }: KanbanBoardProps) {
  const changeStatus = useChangeTaskStatusMutation()
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [dropError, setDropError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const columns = useMemo(() => groupTasksByStatus(tasks), [tasks])
  const tasksById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  )
  const activeTask = activeTaskId
    ? (tasksById.get(activeTaskId) ?? null)
    : null

  function handleDragStart(event: DragStartEvent): void {
    setDropError(null)
    setActiveTaskId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveTaskId(null)

    const { active, over } = event

    if (!over) {
      return
    }

    const taskId = String(active.id)
    const task = tasksById.get(taskId)

    if (!task) {
      return
    }

    const nextStatus = resolveTargetStatus(over.id, tasksById)

    if (!nextStatus || nextStatus === task.status) {
      return
    }

    try {
      await changeStatus.mutateAsync({ id: taskId, status: nextStatus })
      setDropError(null)
    } catch (error: unknown) {
      setDropError(
        getErrorMessage(error, 'Не удалось изменить статус задачи'),
      )
    }
  }

  function handleDragCancel(): void {
    setActiveTaskId(null)
  }

  return (
    <div className="space-y-4">
      {dropError ? (
        <Alert variant="destructive">{dropError}</Alert>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={(event) => {
          void handleDragEnd(event)
        }}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {KANBAN_COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
