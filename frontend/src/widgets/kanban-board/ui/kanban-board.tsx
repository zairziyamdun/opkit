import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { LayoutGroup } from 'framer-motion'
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  type Task,
  type TaskStatus,
} from '@/entities/task'
import { useChangeTaskStatusMutation } from '@/features/change-task-status'
import { getErrorMessage } from '@/shared/api'
import { toast } from '@/shared/ui'
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

const DROP_FADE_MS = 180

/** Fade out in place — без анимации «назад» к старой колонке. */
const dropAnimation: DropAnimation = {
  duration: DROP_FADE_MS,
  easing: 'ease-out',
  keyframes({ transform }) {
    return [
      {
        opacity: 1,
        transform: CSS.Transform.toString(transform.initial),
      },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.initial,
          scaleX: 0.98,
          scaleY: 0.98,
        }),
      },
    ]
  },
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
  // Snapshot на время drag+fade, чтобы overlay не зависел от optimistic cache.
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const fadeTimeoutRef = useRef<number | null>(null)

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

  function clearActiveTaskAfterFade(): void {
    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current)
    }

    fadeTimeoutRef.current = window.setTimeout(() => {
      setActiveTask(null)
      fadeTimeoutRef.current = null
    }, DROP_FADE_MS)
  }

  function handleDragStart(event: DragStartEvent): void {
    const task = tasksById.get(String(event.active.id)) ?? null
    setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    const taskId = String(active.id)
    const task = activeTask ?? tasksById.get(taskId)

    if (!over || !task) {
      clearActiveTaskAfterFade()
      return
    }

    const nextStatus = resolveTargetStatus(over.id, tasksById)

    if (!nextStatus || nextStatus === task.status) {
      clearActiveTaskAfterFade()
      return
    }

    // Сначала optimistic — карточка уже в новой колонке под overlay.
    // Затем fade overlay на месте (без полёта к старой DOM-позиции).
    changeStatus.mutate(
      { id: taskId, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(
            `Перемещена в «${TASK_STATUS_LABELS[nextStatus]}»`,
            'Статус обновлён',
          )
        },
        onError: (error: unknown) => {
          toast.error(
            getErrorMessage(error, 'Не удалось изменить статус задачи'),
            'Ошибка',
          )
        },
      },
    )

    clearActiveTaskAfterFade()
  }

  function handleDragCancel(): void {
    clearActiveTaskAfterFade()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <LayoutGroup>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {KANBAN_COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              activeDragTaskId={activeTask?.id ?? null}
              onTaskDeleted={onTaskDeleted}
            />
          ))}
        </div>
      </LayoutGroup>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
