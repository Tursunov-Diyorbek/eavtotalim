import { apiClientV2 } from './client'
import type {
  DirectorApplicationRow,
  DirectorApplicationsParams,
  DirectorApplicationsPayload,
  DirectorApplicationStatusCounts,
} from '@/types'

type Envelope = {
  success?: boolean
  response_code?: number
  message?: string
  data?: unknown
}

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

function asCounts(value: unknown): DirectorApplicationStatusCounts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as DirectorApplicationStatusCounts
}

function assertOk(res: Envelope) {
  const code = res.response_code
  if (code === 200 || code === 201 || res.success) return
  throw new Error(res.message || 'Applications unavailable')
}

function qs(params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    sp.set(key, String(value))
  }
  const query = sp.toString()
  return query ? `?${query}` : ''
}

/** Default list params — sidebar badge va 1-sahifa shu so‘rovni ulashadi. */
export const APPLICATIONS_SESSION_SHOW_COUNT = 10

export function isDefaultApplicationsParams(
  params: Pick<
    DirectorApplicationsParams,
    'page' | 'showCount' | 'state' | 'search' | 'phone'
  >,
) {
  return (
    params.page === 1 &&
    params.showCount === APPLICATIONS_SESSION_SHOW_COUNT &&
    !params.state &&
    !params.search?.trim() &&
    !params.phone?.trim()
  )
}

/** GET v2 `/road24/applications` */
export async function fetchDirectorApplications(
  params: DirectorApplicationsParams,
): Promise<DirectorApplicationsPayload> {
  const res = await apiClientV2.get<Envelope>(
    `/road24/applications${qs({
      page: params.page,
      show_count: params.showCount,
      state: params.state || null,
      search: params.search?.trim() || null,
      phone: params.phone?.trim() || null,
    })}`,
  )
  assertOk(res)

  const body = (res.data ?? {}) as Record<string, unknown>
  const nested =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : body

  const list = asArray<DirectorApplicationRow>(nested.data ?? nested)
  const total =
    Number(nested.total_items ?? nested.total ?? body.total_items ?? list.length) ||
    list.length
  const page = Number(nested.current_page ?? body.current_page ?? params.page) || params.page
  const lastPage =
    Number(nested.last_page ?? body.last_page) ||
    Math.max(1, Math.ceil(total / params.showCount) || 1)

  return {
    data: list,
    total_items: total,
    current_page: page,
    last_page: lastPage,
    status_counts: asCounts(nested.status_counts ?? body.status_counts),
  }
}

/** PATCH `/road24/applications/:id/accept` */
export async function acceptDirectorApplication(id: number | string) {
  const res = await apiClientV2.patch<Envelope>(
    `/road24/applications/${id}/accept`,
    {},
  )
  assertOk(res)
}

/** PATCH `/road24/applications/:id/cancel` */
export async function cancelDirectorApplication(
  id: number | string,
  comment?: string | null,
) {
  const res = await apiClientV2.patch<Envelope>(
    `/road24/applications/${id}/cancel`,
    { comment: comment?.trim() || null },
  )
  assertOk(res)
}
