import { apiClientV2 } from './client'
import type { OrganizationInfo } from '@/types'

function asData<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as { data?: unknown }
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as T
  }
  return payload as T
}

/** GET v2 /organization-info */
export async function fetchOrganizationInfo(): Promise<OrganizationInfo> {
  const res = await apiClientV2.get<{
    status?: number | string
    message?: string
    data?: unknown
  }>('/organization-info')

  if (res.status != null && Number(res.status) !== 1) {
    throw new Error(res.message || 'Organization info unavailable')
  }

  return asData<OrganizationInfo>(res.data ?? res) ?? {}
}

/** POST v2 /organization-info (FormData) */
export async function updateOrganizationInfo(
  formData: FormData,
): Promise<{ status?: number | string; message?: string }> {
  return apiClientV2.postForm('/organization-info', formData)
}

/** GET v2 /organization-info/bank-name?mfo= */
export async function fetchBankNameByMfo(mfo: string): Promise<string> {
  const res = await apiClientV2.get<{ data?: unknown }>(
    `/organization-info/bank-name?mfo=${encodeURIComponent(mfo)}`,
  )
  if (typeof res.data === 'string') return res.data
  if (res.data && typeof res.data === 'object') {
    const inner = (res.data as { data?: unknown }).data
    if (typeof inner === 'string') return inner
  }
  return ''
}
