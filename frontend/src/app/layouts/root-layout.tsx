import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
