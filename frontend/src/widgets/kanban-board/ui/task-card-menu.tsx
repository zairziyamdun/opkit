import { useEffect, useId, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { Task } from '@/entities/task'
import { DeleteTaskButton } from '@/features/delete-task'
import { UpdateTaskButton } from '@/features/update-task'

interface TaskCardMenuProps {
  readonly task: Task
  readonly onDeleted?: () => void
}

export function TaskCardMenu({ task, onDeleted }: TaskCardMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent): void {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Действия с задачей"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(event) => {
          event.stopPropagation()
          setIsMenuOpen((prev) => !prev)
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </button>

      {isMenuOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-card-hover"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2 text-left text-caption text-foreground hover:bg-muted"
            onClick={() => {
              setIsMenuOpen(false)
              setIsEditOpen(true)
            }}
          >
            Редактировать
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2 text-left text-caption text-destructive hover:bg-destructive/10"
            onClick={() => {
              setIsMenuOpen(false)
              setIsDeleteOpen(true)
            }}
          >
            Удалить
          </button>
        </div>
      ) : null}

      <UpdateTaskButton
        task={task}
        showTrigger={false}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <DeleteTaskButton
        task={task}
        showTrigger={false}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={onDeleted}
      />
    </div>
  )
}
