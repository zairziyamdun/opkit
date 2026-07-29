import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { verifyPasswordRequest } from '../api/change-password-api'

const VERIFY_DEBOUNCE_MS = 200

export type CurrentPasswordStatus =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'invalid'

export function useVerifyCurrentPassword(password: string): {
  readonly status: CurrentPasswordStatus
} {
  const debouncedPassword = useDebouncedValue(password, VERIFY_DEBOUNCE_MS)
  const isSynced = password === debouncedPassword

  const query = useQuery({
    queryKey: ['auth', 'verify-password', debouncedPassword] as const,
    queryFn: () => verifyPasswordRequest({ password: debouncedPassword }),
    enabled: debouncedPassword.length > 0,
    staleTime: 60_000,
    gcTime: 0,
    retry: false,
  })

  if (password.length === 0) {
    return { status: 'idle' }
  }

  if (!isSynced || query.isFetching || query.isPending) {
    return { status: 'checking' }
  }

  if (query.isError) {
    return { status: 'idle' }
  }

  return {
    status: query.data?.valid === true ? 'valid' : 'invalid',
  }
}
