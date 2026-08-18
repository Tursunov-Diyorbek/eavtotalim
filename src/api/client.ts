import { env } from '@/config/env'
import { getAccessToken } from '@/lib/authStorage'
import { LOCALE_STORAGE_KEY } from '@/i18n'
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
}

function acceptLanguage(): string {
  return localStorage.getItem(LOCALE_STORAGE_KEY) || 'uz'
}

function createClient(baseUrl: string) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, formData, headers, ...rest } = options
    const token = getAccessToken()

    const finalHeaders: HeadersInit = {
      'Accept-Language': acceptLanguage(),
      ...headers,
    }

    if (token) {
      ;(finalHeaders as Record<string, string>).Authorization = `Bearer ${token}`
    }

    let requestBody: BodyInit | undefined
    if (formData) {
      requestBody = formData
    } else if (body !== undefined) {
      ;(finalHeaders as Record<string, string>)['Content-Type'] = 'application/json'
      requestBody = JSON.stringify(body)
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: requestBody,
    })

    if (!response.ok) {
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
