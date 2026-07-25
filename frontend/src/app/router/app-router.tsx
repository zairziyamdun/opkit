import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/app/layouts/root-layout'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { RegisterPage } from '@/pages/register'
import { TasksPage } from '@/pages/tasks'
import { ROUTES } from '@/shared/config/routes'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.tasks} element={<TasksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
