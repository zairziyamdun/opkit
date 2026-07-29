import { useQuery } from '@tanstack/react-query'
import { getErrorMessage, isApiError } from '@/shared/api'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { verifyPasswordRequest } from '../api/change-password-api'

const VERIFY_DEBOUNCE_MS = 200

export type CurrentPasswordStatus =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'invalid'
  | 'rate_limited'

export function useVerifyCurrentPassword(password: string): {
  readonly status: CurrentPasswordStatus
  readonly message: string | null
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
    return { status: 'idle', message: null }
  }

  if (!isSynced || query.isFetching || query.isPending) {
    return { status: 'checking', message: null }
  }

  if (query.isError) {
    const isRateLimited =
      isApiError(query.error) && query.error.statusCode === 429

    if (isRateLimited) {
      return {
        status: 'rate_limited',
        message: getErrorMessage(
          query.error,
          'Слишком много проверок. Подождите немного.',
        ),
      }
    }

    return {
      status: 'idle',
      message: getErrorMessage(query.error, 'Не удалось проверить пароль'),
    }
  }

  return {
    status: query.data?.valid === true ? 'valid' : 'invalid',
    message: null,
  }
}
