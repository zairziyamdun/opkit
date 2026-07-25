import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserRequest } from '@/entities/user/api/auth-api'
import { userQueryKeys } from '@/entities/user/model/query-keys'
import { isApiError } from '@/shared/api'
import {
  clearAccessToken,
  useAccessToken,
} from '@/shared/lib/auth-token'

export function useCurrentUser() {
  const accessToken = useAccessToken()
  const hasToken = Boolean(accessToken)

  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: getCurrentUserRequest,
    enabled: hasToken,
    retry: false,
    staleTime: 60_000,
  })
}

export function useAuthSession() {
  const queryClient = useQueryClient()
  const accessToken = useAccessToken()
  const hasToken = Boolean(accessToken)
  const query = useCurrentUser()

  useEffect(() => {
    if (
      query.isError &&
      isApiError(query.error) &&
      query.error.statusCode === 401
    ) {
      clearAccessToken()
      queryClient.removeQueries({ queryKey: userQueryKeys.all })
    }
  }, [query.isError, query.error, queryClient])

  const user = hasToken ? (query.data ?? null) : null
  const isAuthenticated = hasToken && Boolean(user)
  const isLoading =
    hasToken && !user && (query.isPending || query.isFetching)

  return {
    user,
    isAuthenticated,
    isLoading,
    hasToken,
    error: query.error,
    refetch: query.refetch,
  }
}
