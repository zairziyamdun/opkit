import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toApiError } from '@/shared/api/error'
import { ACCESS_TOKEN_KEY } from '@/shared/config/constants'
import { env } from '@/shared/config/env'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(toApiError(error))
  },
)
