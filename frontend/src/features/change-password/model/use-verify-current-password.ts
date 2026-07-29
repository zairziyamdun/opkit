import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { verifyPasswordRequest } from '../api/change-password-api'

const VERIFY_DEBOUNCE_MS = 450

export function useVerifyCurrentPassword(password: string): {
  readonly isValid: boolean
  readonly isChecking: boolean
} {
  const debouncedPassword = useDebouncedValue(password, VERIFY_DEBOUNCE_MS)
  const isSynced = password === debouncedPassword && password.length > 0

  const query = useQuery({
    queryKey: ['auth', 'verify-password', debouncedPassword] as const,
    queryFn: () => verifyPasswordRequest({ password: debouncedPassword }),
    enabled: debouncedPassword.length > 0,
    staleTime: 60_000,
    gcTime: 0,
    retry: false,
  })

  return {
    isValid: isSynced && query.data?.valid === true,
    isChecking: password.length > 0 && (!isSynced || query.isFetching),
  }
}
