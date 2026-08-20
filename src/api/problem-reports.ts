import { apiClientV2 } from './client'
import { assertOk, unwrapEntity } from '@/lib/apiPage'

export type ProblemTypeItem = {
  id: number
  name?: string | null
}

export type ProblemHistoryItem = {
  id: number
  message?: string | null
  created_at?: string | null
  responded_by?: string | null
  students?: { fio?: string | null; subject_id?: number | null }[] | null
}

function asList<T>(payload: unknown): T[] {
  const data = unwrapEntity<unknown>(payload)
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data
  }
  return []
}

/** GET v2 /problem-types/available?context= */
export async function fetchProblemTypes(context: string) {
  const res = await apiClientV2.get<unknown>(
    `/problem-types/available?context=${encodeURIComponent(context)}`,
  )
  assertOk(res as { status?: number | boolean; message?: string })
  return asList<ProblemTypeItem>(res)
}

/** POST v2 /problem-reports */
export async function createProblemReport(payload: {
  problem_type_id: number
  subject_type: string
  subject_id: number | string
  phone: string
  detail?: Record<string, unknown>
}) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/problem-reports', payload)
  assertOk(res)
  return res
}

/** GET v2 /problem-reports/history */
export async function fetchProblemReportHistory(params: {
  subject_type: string
  subject_id: number | string
}) {
  const qs = new URLSearchParams({
    subject_type: params.subject_type,
    subject_id: String(params.subject_id),
  })
  const res = await apiClientV2.get<unknown>(`/problem-reports/history?${qs}`)
  assertOk(res as { status?: number | boolean; message?: string })
  return asList<ProblemHistoryItem>(res)
}
