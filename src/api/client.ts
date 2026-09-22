import { env } from '@/config/env'
import { getAccessToken } from '@/lib/authStorage'
import { LOCALE_STORAGE_KEY } from '@/i18n'
import {
  refreshAccessToken,
  replaceAccessTokenInPath,
  shouldAttemptTokenRefresh,
  triggerForceLogout,
} from '@/lib/tokenRefresh'
import { notify } from '@/components/ui/Notification'
import type { ApiError } from '@/types'

export class HttpError extends Error {
  status: number
  code?: string
  payload?: unknown

  constructor(status: number, body: ApiError, payload?: unknown) {
    super(body.message)
    this.name = 'HttpError'
    this.status = status
    this.code = body.code
    this.payload = payload
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  /** FormData yuborilsa Content-Type qo‘yilmaydi */
  formData?: FormData
  /** Ichki: 401 dan keyin qayta urinish */
  _retried?: boolean
}

function acceptLanguage(): string {
  return localStorage.getItem(LOCALE_STORAGE_KEY) || 'uz'
}

/** 403 / ruxsat xatosi — toast (dedupe qisqa muddat). */
let lastForbiddenToast = { msg: '', at: 0 }
export function notifyForbiddenMessage(message: string | undefined | null) {
  const msg = String(message ?? '').trim()
  if (!msg) return
  const now = Date.now()
  if (msg === lastForbiddenToast.msg && now - lastForbiddenToast.at < 2500) return
  lastForbiddenToast = { msg, at: now }
  notify.error(msg, { duration: 6500 })
}

function createClient(baseUrl: string) {
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, formData, headers, _retried, ...rest } = options
    const token = getAccessToken()

    const finalHeaders: HeadersInit = {
      'Accept-Language': acceptLanguage(),
      ...headers,
    }

    if (token) {
      ;(finalHeaders as Record<string, string>).Authorization =
        `Bearer ${token}`
    }

    let requestBody: BodyInit | undefined
    if (formData) {
      requestBody = formData
    } else if (body !== undefined) {
      ;(finalHeaders as Record<string, string>)['Content-Type'] =
        'application/json'
      requestBody = JSON.stringify(body)
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: requestBody,
    })

    if (!response.ok) {
      if (
        response.status === 401 &&
        !_retried &&
        shouldAttemptTokenRefresh(path)
      ) {
        try {
          const newToken = await refreshAccessToken()
          return request<T>(replaceAccessTokenInPath(path, newToken), {
            ...options,
            _retried: true,
            headers: {
              ...(headers as Record<string, string> | undefined),
              Authorization: `Bearer ${newToken}`,
            },
          })
        } catch {
          // refreshAccessToken allaqachon forceLogout chaqirgan
          throw new HttpError(
            401,
            { message: 'Sessiya muddati tugadi' },
            undefined,
          )
        }
      }

      if (response.status === 401) {
        triggerForceLogout()
      }

      let errorBody: ApiError = { message: response.statusText }
      let payload: unknown
      try {
        payload = await response.json()
        const p = payload as { message?: string; code?: string }
        errorBody = {
          message: p.message || response.statusText,
          code: p.code,
        }
      } catch {
        // keep statusText
      }

      if (response.status === 403) {
        notifyForbiddenMessage(errorBody.message)
      }

      throw new HttpError(response.status, errorBody, payload)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  return {
    get: <T>(path: string, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'POST', body }),
    postForm: <T>(path: string, formData: FormData, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'POST', formData }),
    put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'PUT', body }),
    putForm: <T>(path: string, formData: FormData, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'PUT', formData }),
    patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'PATCH', body }),
    delete: <T>(path: string, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'DELETE' }),
    deleteForm: <T>(path: string, formData: FormData, init?: RequestOptions) =>
      request<T>(path, { ...init, method: 'DELETE', formData }),
  }
}

/** v1 ba'zi endpointlar token ni query da ham kutadi. */
export function withAccessToken(path: string): string {
  const token = getAccessToken()
  if (!token) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}token=${encodeURIComponent(token)}`
}

/** v1 API */
export const apiClient = createClient(env.apiUrl)

/** v2 API — login, captcha, … */
export const apiClientV2 = createClient(env.apiUrlV2)
