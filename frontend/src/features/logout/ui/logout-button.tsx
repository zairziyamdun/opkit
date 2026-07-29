import { Button, type ButtonProps } from '@/shared/ui'
import { useLogoutMutation } from '@/features/logout/model/use-logout'

interface LogoutButtonProps {
  readonly className?: string
  readonly size?: ButtonProps['size']
  readonly variant?: ButtonProps['variant']
}

export function LogoutButton({
  className,
  size = 'sm',
  variant = 'outline',
}: LogoutButtonProps) {
  const logoutMutation = useLogoutMutation()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      isLoading={logoutMutation.isPending}
      onClick={() => logoutMutation.mutate()}
    >
      Выйти
    </Button>
  )
}
