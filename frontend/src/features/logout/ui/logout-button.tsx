import { Button } from '@/shared/ui'
import { useLogoutMutation } from '@/features/logout/model/use-logout'

interface LogoutButtonProps {
  readonly className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const logoutMutation = useLogoutMutation()

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      isLoading={logoutMutation.isPending}
      onClick={() => logoutMutation.mutate()}
    >
      Выйти
    </Button>
  )
}
