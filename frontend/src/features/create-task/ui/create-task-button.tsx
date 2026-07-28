import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  applyTaskFieldErrors,
  TaskForm,
  toCreateTaskPayload,
  type TaskFieldErrorSetter,
  type TaskFormValues,
} from '@/entities/task'
import { useCreateTaskMutation } from '@/features/create-task/model/use-create-task'
import { getErrorMessage } from '@/shared/api'
import { Button, Modal, toast } from '@/shared/ui'

export function CreateTaskButton() {
  const [isOpen, setIsOpen] = useState(false)
  const createTask = useCreateTaskMutation()

  function handleClose(): void {
    if (createTask.isPending) {
      return
    }

    createTask.reset()
    setIsOpen(false)
  }

  async function handleSubmit(
    values: TaskFormValues,
    setFieldError: TaskFieldErrorSetter,
  ): Promise<void> {
    try {
      await createTask.mutateAsync(toCreateTaskPayload(values))
      createTask.reset()
      setIsOpen(false)
      toast.success('Задача добавлена на доску', 'Создано')
    } catch (error: unknown) {
      applyTaskFieldErrors(error, setFieldError)
    }
  }

  return (
    <>
      <Button className="w-full sm:w-auto" onClick={() => setIsOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Создать задачу
      </Button>

      <Modal
        isOpen={isOpen}
        title="Новая задача"
        description="Заполните данные задачи"
        onClose={handleClose}
      >
        <TaskForm
          idPrefix="create-task"
          submitLabel="Создать"
          isPending={createTask.isPending}
          errorMessage={
            createTask.isError
              ? getErrorMessage(createTask.error, 'Не удалось создать задачу')
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </>
  )
}
