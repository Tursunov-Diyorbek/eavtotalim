import { env } from '@/config/env'
import { LOCALE_STORAGE_KEY } from '@/i18n'
import {
  clearAuthSession,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/lib/authStorage'

export const FORCE_LOGOUT_EVENT = 'forceLogout'
export const TOKEN_REFRESHED_EVENT = 'auth:token-refreshed'

export type RefreshTokenData = {
  access_token: string
  refresh_token?: string
}

type ApiEnvelope<T> = {
  status?: number | boolean
  message?: string
  data?: T
}

/** Parallel 401 lar uchun bitta refresh. */
let refreshInflight: Promise<string> | null = null

export function triggerForceLogout() {
  clearAuthSession()
  window.dispatchEvent(new CustomEvent(FORCE_LOGOUT_EVENT))
}

function parseRefreshPayload(payload: unknown): RefreshTokenData {
  const body = payload as RefreshTokenData & ApiEnvelope<RefreshTokenData>
  if (body && typeof body === 'object') {
    if ('access_token' in body && body.access_token) {
      return {
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      }
    }
    if (body.data?.access_token) {
      return {
        access_token: body.data.access_token,
        refresh_token: body.data.refresh_token,
      }
    }
  }
  throw new Error('Refresh response: access_token topilmadi')
}

/**
 * POST /v2/api/auth/refresh-token — apiClient orqali emas (401 loop yo‘q).
 * Muvaffaqiyatda yangi access_token qaytaradi.
 */
export async function refreshAccessToken(): Promise<string> {
  if (refreshInflight) return refreshInflight

  refreshInflight = (async () => {
    const refreshToken = getRefreshToken()
    const deviceId = localStorage.getItem('device_id')

    if (!refreshToken || !deviceId) {
      triggerForceLogout()
      throw new Error('Refresh token yoki device_id yo‘q')
    }

    const response = await fetch(`${env.apiUrlV2}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': localStorage.getItem(LOCALE_STORAGE_KEY) || 'uz',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        device_id: deviceId,
      }),
    })

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = undefined
    }

    if (!response.ok) {
      triggerForceLogout()
      const p = payload as { message?: string } | undefined
      throw new Error(p?.message || `Refresh failed (${response.status})`)
    }

    const data = parseRefreshPayload(payload)
    setAccessToken(data.access_token)
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token)
    }

    window.dispatchEvent(
      new CustomEvent(TOKEN_REFRESHED_EVENT, {
        detail: { accessToken: data.access_token },
      }),
    )

    return data.access_token
  })().finally(() => {
    refreshInflight = null
  })

  return refreshInflight
}

/** Path dagi `token=` query ni yangi access bilan almashtirish. */
export function replaceAccessTokenInPath(path: string, token: string): string {
  if (!/[?&]token=/.test(path)) return path
  return path.replace(
    /([?&]token=)[^&]*/,
    `$1${encodeURIComponent(token)}`,
  )
}

const SKIP_REFRESH_PATHS = [
  '/login',
  '/auth/refresh-token',
  '/auth/logout',
  '/general/get-captcha',
]

export function shouldAttemptTokenRefresh(path: string): boolean {
  return !SKIP_REFRESH_PATHS.some((p) => path.includes(p))
}
