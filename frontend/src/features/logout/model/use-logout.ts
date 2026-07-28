import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logoutRequest, userQueryKeys } from '@/entities/user'
import { disconnectSocket } from '@/shared/api/socket'
import { ROUTES } from '@/shared/config/routes'
import { clearAccessToken } from '@/shared/lib/auth-token'

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest()
      } catch {
        // Даже при ошибке сети очищаем локальную сессию.
      }
    },
    onSettled: () => {
      disconnectSocket()
      clearAccessToken()
      queryClient.setQueryData(userQueryKeys.me(), null)
      queryClient.removeQueries({ queryKey: userQueryKeys.all })
      void navigate(ROUTES.login, { replace: true })
    },
  })
}
