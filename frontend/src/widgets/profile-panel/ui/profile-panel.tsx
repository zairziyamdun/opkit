import { useAuthSession } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, PageLoader } from '@/shared/ui'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ProfilePanel() {
  const { user, isLoading, error, refetch } = useAuthSession()

  if (isLoading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Профиль
        </h1>
        <Alert variant="destructive">
          {getErrorMessage(error, 'Не удалось загрузить профиль')}
        </Alert>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Повторить
        </Button>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Профиль
        </h1>
        <Alert>Данные пользователя недоступны</Alert>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Профиль
        </h1>
        <p className="text-small text-muted-foreground">
          Информация о вашем аккаунте
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <dl className="space-y-4">
          <div className="space-y-1">
            <dt className="text-small text-muted-foreground">Имя</dt>
            <dd className="text-small font-medium text-foreground">
              {user.name}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-muted-foreground">Email</dt>
            <dd className="text-small font-medium text-foreground">
              {user.email}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-muted-foreground">Дата регистрации</dt>
            <dd className="text-small font-medium text-foreground">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-small text-muted-foreground">Обновлён</dt>
            <dd className="text-small font-medium text-foreground">
              {formatDate(user.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-center">
        <LogoutButton />
      </div>
    </section>
  )
}
