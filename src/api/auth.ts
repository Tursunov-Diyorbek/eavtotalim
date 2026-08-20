import { apiClientV2 } from './client'
import {
  generateDeviceId,
  getModelDevice,
  getPlatform,
} from '@/lib/device'
import { dedupeAsync } from '@/lib/dedupeAsync'
import type { LoginTokens } from '@/lib/authStorage'

export type ApiEnvelope<T> = {
  status: number
  message: string
  response_code?: number
  data: T
}

export type CaptchaData = {
  key: string
  image: string
}

const captchaInflight = new Map<string, Promise<CaptchaData>>()

export type LoginResponseData = LoginTokens & {
  access_token: string
  refresh_token?: string
  roles?: unknown
  permissions?: unknown
}

async function fetchCaptchaRaw(): Promise<CaptchaData> {
  const res = await apiClientV2.get<ApiEnvelope<CaptchaData>>(
    '/general/get-captcha',
  )
  return res.data
}

/**
 * Parallel/StrictMode x2 chaqiriqlarni bitta tarmoq so‘roviga birlashtiradi.
 * `force: true` — yangilash tugmasi: dedupe o‘tkazib, yangi captcha oladi.
 */
export function fetchCaptcha(options?: {
  force?: boolean
}): Promise<CaptchaData> {
  if (options?.force) return fetchCaptchaRaw()
  return dedupeAsync('get-captcha', captchaInflight, fetchCaptchaRaw)
}

export function createLoginFormData(
  username: string,
  password: string,
  captchaKey?: string,
  captchaCode?: string,
): FormData {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  formData.append('device', 'web')
  formData.append('device_id', generateDeviceId())
  formData.append('model_device', getModelDevice())
  formData.append('platform', getPlatform())
  if (captchaKey) formData.append('captcha_key', captchaKey)
  if (captchaCode) formData.append('captcha_code', captchaCode)
  return formData
}

export async function loginRequest(
  username: string,
  password: string,
  captchaKey?: string,
  captchaCode?: string,
): Promise<LoginResponseData> {
  const formData = createLoginFormData(
    username,
    password,
    captchaKey,
    captchaCode,
  )

  const res = await apiClientV2.postForm<
    LoginResponseData | ApiEnvelope<LoginResponseData>
  >('/login', formData)

  const body = res as LoginResponseData & ApiEnvelope<LoginResponseData>
  if (body.status === 0 || body.status === false) {
    throw new Error(body.message || 'Login failed')
  }

  // Ba'zi javoblar to'g'ridan-to'g'ri token, ba'zilari envelope
  if ('access_token' in res && res.access_token) {
    return res
  }

  if ('data' in res && res.data?.access_token) {
    return res.data
  }

  throw new Error(body.message || 'Login response: access_token topilmadi')
}

export type LogoutPayload = {
  device: string
  device_id: string
  model_device: string
  platform: string
}

export function createLogoutPayload(): LogoutPayload {
  return {
    device: 'web',
    device_id: generateDeviceId(),
    model_device: getModelDevice(),
    platform: getPlatform(),
  }
}

/** POST /auth/logout — body: device, device_id, model_device, platform */
export async function logoutRequest(): Promise<void> {
  await apiClientV2.post('/auth/logout', createLogoutPayload())
}
