import { useState } from 'react'
import {
  applyTaskFieldErrors,
  TaskForm,
  toTaskFormValues,
  toUpdateTaskPayload,
  type Task,
  type TaskFieldErrorSetter,
  type TaskFormValues,
} from '@/entities/task'
import { useUpdateTaskMutation } from '@/features/update-task/model/use-update-task'
import { getErrorMessage } from '@/shared/api'
import { Button, Modal, toast } from '@/shared/ui'

interface UpdateTaskButtonProps {
  readonly task: Task
  readonly open?: boolean
  readonly onOpenChange?: (open: boolean) => void
  readonly showTrigger?: boolean
}

export function UpdateTaskButton({
  task,
  open,
  onOpenChange,
  showTrigger = true,
}: UpdateTaskButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isOpen = open ?? uncontrolledOpen
  const updateTask = useUpdateTaskMutation()

  function setIsOpen(next: boolean): void {
    onOpenChange?.(next)
    if (open === undefined) {
      setUncontrolledOpen(next)
    }
  }

  function handleClose(): void {
    if (updateTask.isPending) {
      return
    }

    updateTask.reset()
    setIsOpen(false)
  }

  async function handleSubmit(
    values: TaskFormValues,
    setFieldError: TaskFieldErrorSetter,
  ): Promise<void> {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        payload: toUpdateTaskPayload(values),
      })
      updateTask.reset()
      setIsOpen(false)
      toast.success('Изменения сохранены', 'Обновлено')
    } catch (error: unknown) {
      applyTaskFieldErrors(error, setFieldError)
    }
  }

  return (
    <>
      {showTrigger ? (
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          Изменить
        </Button>
      ) : null}

      <Modal
        isOpen={isOpen}
        title="Редактирование задачи"
        description="Измените данные задачи"
        onClose={handleClose}
      >
        <TaskForm
          idPrefix={`update-task-${task.id}`}
          submitLabel="Сохранить"
          isPending={updateTask.isPending}
          defaultValues={toTaskFormValues(task)}
          errorMessage={
            updateTask.isError
              ? getErrorMessage(updateTask.error, 'Не удалось обновить задачу')
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </>
  )
}
