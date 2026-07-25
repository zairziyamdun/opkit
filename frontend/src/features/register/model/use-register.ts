import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { registerRequest, userQueryKeys } from '@/entities/user'
import type { RegisterPayload } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { setAccessToken } from '@/shared/lib/auth-token'

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      queryClient.setQueryData(userQueryKeys.me(), data.user)
      void navigate(ROUTES.tasks, { replace: true })
    },
  })
}
