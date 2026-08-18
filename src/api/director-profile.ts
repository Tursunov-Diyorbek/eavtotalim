import { apiClient, apiClientV2 } from './client'
import { getAccessToken } from '@/lib/authStorage'
import type {
  DirectorEditData,
  MspdPersonInfo,
  MspdSearchPayload,
} from '@/types'

function withToken(path: string): string {
  const token = getAccessToken()
  if (!token) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}token=${encodeURIComponent(token)}`
}

function asData<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as { data?: unknown }
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as T
  }
  return payload as T
}

/** GET v1 /director/edit-my-data */
export async function fetchDirectorEditMyData(): Promise<DirectorEditData> {
  const res = await apiClient.get<{
    status?: number | string
    message?: string
    data?: unknown
  }>(withToken('/director/edit-my-data'))

  if (res.status != null && Number(res.status) !== 1) {
    throw new Error(res.message || 'Director data unavailable')
  }

  return asData<DirectorEditData>(res.data ?? res) ?? {}
}

/** POST v1 /director/update-my-data (FormData, bir marta saqlash) */
export async function updateDirectorMyData(
  formData: FormData,
): Promise<{ status?: number | string; message?: string }> {
  return apiClient.postForm(withToken('/director/update-my-data'), formData)
}

/** POST v2 /eavtotalim-mspd/person-info */
export async function fetchMspdPersonInfo(
  payload: MspdSearchPayload,
): Promise<{ status?: number; data?: MspdPersonInfo; message?: string }> {
  return apiClientV2.post('/eavtotalim-mspd/person-info', payload)
}
