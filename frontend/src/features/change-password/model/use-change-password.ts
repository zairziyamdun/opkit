import { useMutation } from '@tanstack/react-query'
import { changePasswordRequest } from '../api/change-password-api'

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePasswordRequest,
  })
}
