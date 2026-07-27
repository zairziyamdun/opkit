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

export function UpdateTaskButton({ task }: { readonly task: Task }) {
  const [isOpen, setIsOpen] = useState(false)
  const updateTask = useUpdateTaskMutation()

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
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        Изменить
      </Button>

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
