import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col pb-[env(safe-area-inset-bottom)]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
        <Outlet />
      </main>
    </div>
  )
}
