import { apiClient } from '@/shared/api'

export interface ChangePasswordPayload {
  readonly currentPassword: string
  readonly newPassword: string
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.patch('/auth/change-password', payload)
}
