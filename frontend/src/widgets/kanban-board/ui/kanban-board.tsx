import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { LayoutGroup } from 'framer-motion'
import { TASK_STATUS_LABELS, type Task } from '@/entities/task'
import { useChangeTaskStatusMutation } from '@/features/change-task-status'
import { useDeleteTaskMutation } from '@/features/delete-task'
import { getErrorMessage } from '@/shared/api'
import { toast } from '@/shared/ui'
import {
  DROP_FADE_MS,
  dropAnimation,
  resolveTargetStatus,
} from '../lib/kanban-dnd'
import {
  KANBAN_COLUMN_ORDER,
  groupTasksByStatus,
} from '../lib/group-tasks-by-status'
import { KanbanColumn } from './kanban-column'
import {
  KANBAN_DANGER_ZONE_ID,
  KanbanDangerZone,
} from './kanban-danger-zone'
import { TaskCard } from './task-card'

interface KanbanBoardProps {
  readonly tasks: readonly Task[]
  readonly onTaskDeleted?: () => void
}

export function KanbanBoard({ tasks, onTaskDeleted }: KanbanBoardProps) {
  const changeStatus = useChangeTaskStatusMutation()
  const deleteTask = useDeleteTaskMutation()
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

  useEffect(() => {
    if (activeTask === null) {
      return
    }

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    return () => {
      root.style.overflow = previousOverflow
    }
  }, [activeTask])

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
    setActiveTask(tasksById.get(String(event.active.id)) ?? null)
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    const taskId = String(active.id)
    const task = activeTask ?? tasksById.get(taskId)

    if (!over || !task) {
      clearActiveTaskAfterFade()
      return
    }

    if (String(over.id) === KANBAN_DANGER_ZONE_ID) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          toast.success(`«${task.title}» удалена`, 'Удалено')
          onTaskDeleted?.()
        },
        onError: (error: unknown) => {
          toast.error(
            getErrorMessage(error, 'Не удалось удалить задачу'),
            'Ошибка',
          )
        },
      })
      clearActiveTaskAfterFade()
      return
    }

    const nextStatus = resolveTargetStatus(over.id, tasksById)

    if (!nextStatus || nextStatus === task.status) {
      clearActiveTaskAfterFade()
      return
    }

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

  const overlay =
    typeof document === 'undefined'
      ? null
      : createPortal(
          <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden [contain:paint]">
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <TaskCard task={activeTask} isDragOverlay />
              ) : null}
            </DragOverlay>
          </div>,
          document.body,
        )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      autoScroll={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={clearActiveTaskAfterFade}
    >
      <LayoutGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(3,minmax(280px,1fr))]">
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

      <KanbanDangerZone isVisible={activeTask !== null} />

      {overlay}
    </DndContext>
  )
}
