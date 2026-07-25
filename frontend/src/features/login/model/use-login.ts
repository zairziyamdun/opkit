import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loginRequest, userQueryKeys } from '@/entities/user'
import type { LoginPayload } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { setAccessToken } from '@/shared/lib/auth-token'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      queryClient.setQueryData(userQueryKeys.me(), data.user)
      void navigate(ROUTES.tasks, { replace: true })
    },
  })
}
