import { useSyncExternalStore } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ToastItemView } from './toast-item'
import { toastStore } from './toast-store'

export function Toaster() {
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot,
  )

  return (
    <div
      aria-label="Уведомления"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex max-h-[calc(100svh-2rem)] w-[min(100vw-2rem,22rem)] flex-col gap-2 overflow-y-auto"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <ToastItemView key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  )
}
