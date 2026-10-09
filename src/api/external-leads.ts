import { apiClientV2 } from './client'
import { assertOk, unwrapEntity } from '@/lib/apiPage'

export type ExternalLead = {
  id: number
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  source?: string | null
  created_at?: string | null
  status?: string | null
  comment?: string | null
  unlocked_at?: string | null
}

export type LeadStats = {
  total_limit?: number | null
  total_used_limit?: number | null
  free_limit?: number | null
  limit?: number | null
  used_limit?: number | null
}

export type LeadStatus = '' | 'new' | 'contacted' | 'registered' | 'rejected'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>
    if (Array.isArray(body.data)) return body.data as T[]
    if (body.data && typeof body.data === 'object') {
      const inner = body.data as Record<string, unknown>
      if (Array.isArray(inner.data)) return inner.data as T[]
    }
  }
  return []
}

/** GET v2 /organizations/external-leads */
export async function fetchExternalLeads(status: LeadStatus) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/organizations/external-leads${qs}`,
  )
  assertOk(res)
  return asList<ExternalLead>(res)
}

/** GET v2 /organizations/lead-limits/my-stats */
export async function fetchLeadStats() {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/organizations/lead-limits/my-stats',
  )
  assertOk(res)
  return unwrapEntity<LeadStats>(res)
}

/** POST v2 /organizations/external-leads/:id/unlock */
export async function unlockExternalLead(id: number) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/organizations/external-leads/${id}/unlock`,
    {},
  )
  assertOk(res)
  return res
}

/** PUT v2 /organizations/external-leads/:id */
export async function updateExternalLead(
  id: number,
  payload: { status: string; comment: string },
) {
  const res = await apiClientV2.put<{ status?: number | boolean; message?: string }>(
    `/organizations/external-leads/${id}`,
    payload,
  )
  assertOk(res)
  return res
}
