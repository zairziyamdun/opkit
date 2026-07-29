import { apiClient } from '@/shared/api'

export interface ChangePasswordPayload {
  readonly currentPassword: string
  readonly newPassword: string
}

export interface VerifyPasswordPayload {
  readonly password: string
}

export interface VerifyPasswordResponse {
  readonly valid: boolean
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.patch('/auth/change-password', payload)
}

export async function verifyPasswordRequest(
  payload: VerifyPasswordPayload,
): Promise<VerifyPasswordResponse> {
  const { data } = await apiClient.post<VerifyPasswordResponse>(
    '/auth/verify-password',
    payload,
  )
  return data
}
