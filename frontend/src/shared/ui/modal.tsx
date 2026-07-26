import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  readonly isOpen: boolean
  readonly title: string
  readonly description?: string
  readonly onClose: () => void
  readonly children: ReactNode
}

export function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 cursor-default bg-foreground/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-modal border border-border bg-card p-6 shadow-modal"
      >
        <h2
          id={titleId}
          className="text-h3 font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-small text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
