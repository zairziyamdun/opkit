import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toApiError } from '@/shared/api/error'
import { env } from '@/shared/config/env'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/shared/lib/auth-token'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  readonly accessToken: string
}

const REFRESH_URL = '/auth/refresh'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
  withCredentials: true,
})

let refreshPromise: Promise<string> | null = null

function isAuthRefreshRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return url.includes(REFRESH_URL) || url.includes('/auth/logout')
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>(REFRESH_URL)
      .then((response) => {
        const token = response.data.accessToken
        setAccessToken(token)
        return token
      })
      .catch((error: unknown) => {
        clearAccessToken()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRefreshRequest(originalRequest)
    ) {
      originalRequest._retry = true

      try {
        const token = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      } catch {
        return Promise.reject(toApiError(error))
      }
    }

    return Promise.reject(toApiError(error))
  },
)

export async function refreshSessionRequest(): Promise<string> {
  return refreshAccessToken()
}
