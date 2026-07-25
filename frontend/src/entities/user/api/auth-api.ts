import { apiClient } from '@/shared/api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/entities/user/model/types'

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/register',
    payload,
  )
  return data
}

export async function getCurrentUserRequest(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}
