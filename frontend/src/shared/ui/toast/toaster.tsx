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
      className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex max-h-[calc(100svh-2rem)] w-[min(100vw-1.5rem,22rem)] flex-col-reverse gap-2 overflow-y-auto sm:right-4"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <ToastItemView key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  )
}
