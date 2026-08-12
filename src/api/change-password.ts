import { apiClient } from './client'

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export type ChangePasswordResult = {
  response_code?: number
  message?: string
  status?: number | string
}

/** POST /change-password */
export function changePassword(payload: ChangePasswordPayload) {
  return apiClient.post<ChangePasswordResult>('/change-password', payload)
}
