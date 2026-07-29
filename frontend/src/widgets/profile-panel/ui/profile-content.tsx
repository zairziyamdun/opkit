import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Mail,
  RefreshCw,
  Shield,
  UserRound,
} from 'lucide-react'
import { getUserInitials, type User } from '@/entities/user'
import { ChangePasswordButton } from '@/features/change-password'
import { LogoutButton } from '@/features/logout'
import { ROUTES } from '@/shared/config/routes'
import { CopyIdButton } from './copy-id-button'
import { ProfileField } from './profile-field'

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMemberSince(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

interface ProfileContentProps {
  readonly user: User
}

export function ProfileContent({ user }: ProfileContentProps) {
  const initials = getUserInitials(user.name)

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-h2 font-semibold tracking-tight text-foreground">
            Профиль
          </h1>
          <p className="text-small text-muted-foreground">
            Данные аккаунта и параметры сессии
          </p>
        </div>
        <Link
          to={ROUTES.tasks}
          className="text-small font-medium text-primary hover:text-primary-hover"
        >
          Перейти к задачам
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-muted/60 px-5 py-6 sm:px-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-h3 font-semibold text-primary-foreground shadow-sm sm:size-20 sm:text-h2"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h2 className="truncate text-h3 font-semibold tracking-tight text-foreground">
                {user.name}
              </h2>
              <p className="break-all text-small text-muted-foreground">
                {user.email}
              </p>
              <p className="text-caption text-muted-foreground">
                В системе с {formatMemberSince(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="border-b border-border px-5 py-3 sm:px-6">
            <h3 className="text-small font-semibold text-foreground">
              Аккаунт
            </h3>
          </div>
          <ProfileField
            icon={<UserRound className="size-4" aria-hidden />}
            label="Имя"
            value={user.name}
          />
          <ProfileField
            icon={<Mail className="size-4" aria-hidden />}
            label="Email"
            value={user.email}
          />
          <ProfileField
            icon={<Shield className="size-4" aria-hidden />}
            label="ID пользователя"
            value={user.id}
            mono
            action={<CopyIdButton value={user.id} />}
          />
          <ProfileField
            icon={<CalendarDays className="size-4" aria-hidden />}
            label="Дата регистрации"
            value={formatDateTime(user.createdAt)}
          />
          <ProfileField
            icon={<RefreshCw className="size-4" aria-hidden />}
            label="Последнее обновление"
            value={formatDateTime(user.updatedAt)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-3 sm:px-6">
          <h3 className="text-small font-semibold text-foreground">
            Безопасность
          </h3>
        </div>
        <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-1">
            <p className="text-small font-medium text-foreground">Пароль</p>
            <p className="max-w-md text-caption text-muted-foreground">
              Рекомендуем периодически обновлять пароль для повышения
              безопасности аккаунта.
            </p>
          </div>
          <ChangePasswordButton />
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-3 sm:px-6">
          <h3 className="text-small font-semibold text-foreground">Сессия</h3>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-1">
            <p className="text-small font-medium text-foreground">
              Выйти из аккаунта
            </p>
            <p className="max-w-md text-caption text-muted-foreground">
              Завершите текущую сессию на этом устройстве. Для доступа снова
              потребуется вход.
            </p>
          </div>
          <LogoutButton
            variant="destructive"
            size="default"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </section>
  )
}
