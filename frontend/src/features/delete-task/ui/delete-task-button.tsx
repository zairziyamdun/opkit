import { useState } from 'react'
import type { Task } from '@/entities/task'
import { useDeleteTaskMutation } from '@/features/delete-task/model/use-delete-task'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, Modal, toast } from '@/shared/ui'

interface DeleteTaskButtonProps {
  readonly task: Task
  readonly onDeleted?: () => void
}

export function DeleteTaskButton({ task, onDeleted }: DeleteTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const deleteTask = useDeleteTaskMutation()

  function handleClose(): void {
    if (deleteTask.isPending) {
      return
    }

    deleteTask.reset()
    setIsOpen(false)
  }

  async function handleConfirm(): Promise<void> {
    try {
      await deleteTask.mutateAsync(task.id)
      deleteTask.reset()
      setIsOpen(false)
      toast.success(`«${task.title}» удалена`, 'Удалено')
      onDeleted?.()
    } catch {
      // Сообщение об ошибке показывается внутри модального окна
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        Удалить
      </Button>

      <Modal
        isOpen={isOpen}
        title="Удалить задачу?"
        description={`Задача «${task.title}» будет удалена без возможности восстановления.`}
        onClose={handleClose}
      >
        <div className="space-y-4">
          {deleteTask.isError ? (
            <Alert variant="destructive">
              {getErrorMessage(deleteTask.error, 'Не удалось удалить задачу')}
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={deleteTask.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteTask.isPending}
              onClick={() => void handleConfirm()}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
