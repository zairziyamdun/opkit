import { useAuthSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Alert, Button, PageLoader } from '@/shared/ui'
import { ProfileContent } from './profile-content'

export function ProfilePanel() {
  const { user, isLoading, error, refetch } = useAuthSession()

  if (isLoading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4">
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
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-h2 font-semibold tracking-tight text-foreground">
          Профиль
        </h1>
        <Alert>Данные пользователя недоступны</Alert>
      </section>
    )
  }

  return <ProfileContent user={user} />
}
