import { useState } from 'react'
import type { Task } from '@/entities/task'
import { useDeleteTaskMutation } from '@/features/delete-task/model/use-delete-task'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, Modal, toast } from '@/shared/ui'

interface DeleteTaskButtonProps {
  readonly task: Task
  readonly onDeleted?: () => void
  readonly open?: boolean
  readonly onOpenChange?: (open: boolean) => void
  readonly showTrigger?: boolean
}

export function DeleteTaskButton({
  task,
  onDeleted,
  open,
  onOpenChange,
  showTrigger = true,
}: DeleteTaskButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isOpen = open ?? uncontrolledOpen
  const deleteTask = useDeleteTaskMutation()

  function setIsOpen(next: boolean): void {
    onOpenChange?.(next)
    if (open === undefined) {
      setUncontrolledOpen(next)
    }
  }

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
      {showTrigger ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setIsOpen(true)}
        >
          Удалить
        </Button>
      ) : null}

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

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleClose}
              disabled={deleteTask.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
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
