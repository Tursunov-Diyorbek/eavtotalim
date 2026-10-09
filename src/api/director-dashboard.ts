import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapPage } from '@/lib/apiPage'
import type {
  AutodromeCameraItem,
  AutodromeFreeSpace,
  AutodromeWithCameras,
  DailyPaymentByType,
  DailyPaymentItem,
  FaceControlDashboard,
  FaceControlWarning,
  GaiRatingStats,
  StudentImageGroupRow,
  StudentImageGroupStudentsPage,
  StudentImageStatsSummary,
  StudentImageStudentRow,
  StudentImageStudentStatus,
} from '@/types'

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

function asObject<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }
  const obj = payload as { data?: unknown }
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as T
  }
  return payload as T
}

function todayIso(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Kunlik tushum turlari — GET /school-payment/by-type-payment */
export async function fetchDailyPaymentByType(
  fromDate = todayIso(),
  toDate = todayIso(),
): Promise<DailyPaymentByType[]> {
  const res = await apiClientV2.get<{
    status?: number
    ok?: number
    data?: unknown
    message?: string
  }>(`/school-payment/by-type-payment?from_date=${fromDate}&to_date=${toDate}`)

  if (res.status === 0 || res.ok === 0) {
    throw new Error(res.message || 'Daily payments unavailable')
  }

  return asArray<DailyPaymentByType>(res.data ?? res)
}

/** Kunlik tushumlar ro‘yxati — GET /school-payment/daily-payment */
export async function fetchDailyPayments(
  fromDate = todayIso(),
  toDate = todayIso(),
): Promise<DailyPaymentItem[]> {
  const res = await apiClientV2.get<{
    status?: number
    ok?: number
    data?: unknown
    message?: string
  }>(`/school-payment/daily-payment?from_date=${fromDate}&to_date=${toDate}`)

  if (res.status === 0 || res.ok === 0) {
    throw new Error(res.message || 'Daily payment list unavailable')
  }

  return asArray<DailyPaymentItem>(res.data ?? res)
}

/** O‘quvchilarga ta’lim narxini ko‘rsatish — POST /organization-enable-payment */
export async function setOrganizationEnablePayment(
  enablePayment: 0 | 1,
): Promise<0 | 1> {
  const res = await apiClientV2.post<{
    message?: string
    data?: { enable_payment?: number }
    status?: number
  }>('/organization-enable-payment', { enable_payment: enablePayment })

  const next = res.data?.enable_payment
  if (next === 0 || next === 1) return next
  return enablePayment
}

/** O‘quvchi rasmlari KPI — GET /organization/student-image-stats/summary */
export async function fetchStudentImageStats(): Promise<StudentImageStatsSummary> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
  }>('/organization/student-image-stats/summary')

  return asObject<StudentImageStatsSummary>(res.data ?? res) ?? {}
}

/** Guruhlar bo‘yicha rasm holati — GET /organization/student-image-stats/groups */
export async function fetchStudentImageStatsGroups(): Promise<StudentImageGroupRow[]> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>('/organization/student-image-stats/groups')

  if (res.status === 0) {
    throw new Error(res.message || 'Image stats groups unavailable')
  }

  return asArray<StudentImageGroupRow>(res.data ?? res)
}

type GroupStudentsParams = {
  page: number
  perPage?: number
  status?: StudentImageStudentStatus
  search?: string
}

/** Guruh o‘quvchilari — GET /organization/student-image-stats/groups/:id/students */
export async function fetchStudentImageStatsGroupStudents(
  groupId: number | string,
  params: GroupStudentsParams,
): Promise<StudentImageGroupStudentsPage> {
  const perPage = params.perPage ?? 30
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('per_page', String(perPage))
  if (params.status) query.set('status', params.status)
  if (params.search?.trim()) query.set('search', params.search.trim())

  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    meta?: {
      current_page?: number
      last_page?: number
      total?: number
      per_page?: number
    }
    total?: number
    current_page?: number
    last_page?: number
    message?: string
  }>(`/organization/student-image-stats/groups/${groupId}/students?${query}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Image stats students unavailable')
  }

  const list = asArray<StudentImageStudentRow>(res.data ?? res)
  const nested =
    res.data && typeof res.data === 'object' && !Array.isArray(res.data)
      ? (res.data as Record<string, unknown>)
      : null
  const meta = res.meta
  const total =
    Number(meta?.total ?? res.total ?? nested?.total ?? nested?.total_items ?? list.length) ||
    list.length
  const page =
    Number(meta?.current_page ?? res.current_page ?? nested?.current_page ?? params.page) ||
    params.page
  const lastPage =
    Number(meta?.last_page ?? res.last_page ?? nested?.last_page) ||
    Math.max(1, Math.ceil(total / perPage) || 1)
  const size = Number(meta?.per_page ?? nested?.per_page ?? perPage) || perPage

  return { data: list, total, page, lastPage, perPage: size }
}

/** Face control ogohlantirishlari — GET /face-control-warnings/dashboard */
export async function fetchFaceControlDashboard(): Promise<FaceControlDashboard> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
  }>('/face-control-warnings/dashboard')

  return asObject<FaceControlDashboard>(res.data ?? res) ?? {}
}

export type FaceWarningView = 'unseen' | 'seen' | 'all'

/** Ro‘yxat: ko‘rilmagan / ko‘rilgan / barchasi */
export async function fetchFaceControlWarningList(view: FaceWarningView) {
  const path =
    view === 'seen'
      ? '/face-control-warnings/seen'
      : view === 'all'
        ? '/face-control-warnings/index'
        : '/face-control-warnings/unseen'
  const query = buildListQuery({
    page: 1,
    show_count: 100,
    extra: view === 'all' ? undefined : { is_seen: view === 'seen' ? '1' : '0' },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(`${path}?${query}`)
  assertOk(res)
  return unwrapPage<FaceControlWarning>(res, 1, 100)
}

/** Ogohlantirishni o‘qilgan deb belgilash */
export async function markFaceControlWarningSeen(
  id: number | string,
): Promise<void> {
  await apiClientV2.post(`/face-control-warnings/${id}/mark-seen`, {})
}

type AgreementRow = {
  end_date?: string | null
  autodrome?: {
    id?: number
    name?: string | null
    inn?: string | null
    autodrome_has_free_space?: AutodromeFreeSpace | null
  } | null
  organization_autodrome_agreement_status?: { id?: number | string | null } | null
  organization_autodrome_agreement_status_id?: number | string | null
  autodrome_has_free_space?: AutodromeFreeSpace | null
}

/** Kamera javobi: `[…]`, `{ data: […] }`, `{ data: { data: […] } }`, `{ cameras: […] }`. */
function cameraList(payload: unknown): AutodromeCameraItem[] {
  const direct = asArray<AutodromeCameraItem>(payload)
  if (direct.length > 0) return direct

  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>
    const deep = asArray<AutodromeCameraItem>(inner)
    if (deep.length > 0) return deep
    if (Array.isArray(inner.cameras)) return inner.cameras as AutodromeCameraItem[]
  }
  if (Array.isArray(body.cameras)) return body.cameras as AutodromeCameraItem[]
  return []
}

function daysUntil(value?: string | null): number | null {
  if (!value) return null
  const end = new Date(value)
  if (Number.isNaN(end.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86400000)
}

function isContractActive(endDate?: string | null) {
  const days = daysUntil(endDate)
  return days != null && days >= 0
}

/** Faol shartnomali avtodromlar + kameralar + A/B/E joy (eski AutodromeCamerasCompact) */
export async function fetchDirectorAutodromeCameras(): Promise<
  AutodromeWithCameras[]
> {
  const res = await apiClientV2.get<{
    response_code?: number
    status?: number
    data?: unknown
  }>('/autodrome-agreements/index-agreements?show_count=500')

  const rows = asArray<AgreementRow>(res.data)
  const map = new Map<
    number,
    {
      id: number
      name?: string | null
      inn?: string | null
      endDate?: string | null
      freeSpace: AutodromeFreeSpace
    }
  >()

  for (const row of rows) {
    const a = row.autodrome
    if (!a?.id) continue

    const statusId = Number(
      row.organization_autodrome_agreement_status?.id ??
        row.organization_autodrome_agreement_status_id,
    )
    if (statusId !== 1 && statusId !== 2) continue
    if (!isContractActive(row.end_date)) continue
    if (map.has(a.id)) continue

    map.set(a.id, {
      id: a.id,
      name: a.name,
      inn: a.inn,
      endDate: row.end_date,
      freeSpace:
        row.autodrome_has_free_space ||
        a.autodrome_has_free_space ||
        {},
    })
  }

  const autodromes = Array.from(map.values())
  const withCams = await Promise.all(
    autodromes.map(async (a) => {
      try {
        const cr = await apiClientV2.get<{
          status?: number
          data?: unknown
        }>(`/autodrome-agreements/camera-statuses/${a.id}?show_count=200`)
        return {
          ...a,
          cameras: cameraList(cr),
        }
      } catch {
        return { ...a, cameras: [] }
      }
    }),
  )

  return withCams
}

/** Direktor o‘z tashkiloti GAI reytingi — GET v2 /organization-gai-rating/my-stats */
export async function fetchMyGaiRating(
  year: number,
  period: number,
): Promise<GaiRatingStats | null> {
  const res = await apiClientV2.get<{
    status?: number | boolean | string
    message?: string
    data?: unknown
  }>(`/organization-gai-rating/my-stats?year=${year}&period=${period}`)
  assertOk(res)
  return asGaiRating(res.data ?? res)
}

function asGaiRating(payload: unknown): GaiRatingStats | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const body = payload as GaiRatingStats & { data?: unknown }
  const inner = body.data
  const candidate =
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? (inner as GaiRatingStats)
      : body
  if (candidate.total_score == null && !candidate.criteria?.length && candidate.rank == null) {
    return null
  }
  return candidate
}

export { todayIso }
