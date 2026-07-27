import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'

export const KANBAN_DANGER_ZONE_ID = 'danger-zone' as const

interface KanbanDangerZoneProps {
  readonly isVisible: boolean
}

export function KanbanDangerZone({ isVisible }: KanbanDangerZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: KANBAN_DANGER_ZONE_ID,
    data: {
      type: 'danger-zone',
    },
    disabled: !isVisible,
  })

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="danger-zone"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4"
        >
          <div
            ref={setNodeRef}
            className={cn(
              'pointer-events-auto flex min-h-14 w-full max-w-xl items-center justify-center gap-2 rounded-xl border px-5 py-3 text-small font-medium shadow-modal transition-colors',
              isOver
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'border-destructive/30 bg-card text-destructive',
            )}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            {isOver
              ? 'Отпустите, чтобы удалить'
              : 'Перетащите сюда, чтобы удалить'}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
