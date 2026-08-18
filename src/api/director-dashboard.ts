import { apiClientV2 } from './client'
import type {
  AutodromeCameraItem,
  AutodromeWithCameras,
  DailyPaymentByType,
  FaceControlDashboard,
  StudentImageStatsSummary,
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

/** Face control ogohlantirishlari — GET /face-control-warnings/dashboard */
export async function fetchFaceControlDashboard(): Promise<FaceControlDashboard> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
  }>('/face-control-warnings/dashboard')

  return asObject<FaceControlDashboard>(res.data ?? res) ?? {}
}

/** Ogohlantirishni o‘qilgan deb belgilash */
export async function markFaceControlWarningSeen(
  id: number | string,
): Promise<void> {
  await apiClientV2.post(`/face-control-warnings/${id}/mark-seen`, {})
}

type AgreementRow = {
  autodrome?: { id?: number; name?: string | null; inn?: string | null } | null
}

/** Shartnoma avtodromlari + kameralar */
export async function fetchDirectorAutodromeCameras(): Promise<
  AutodromeWithCameras[]
> {
  const res = await apiClientV2.get<{
    response_code?: number
    status?: number
    data?: unknown
  }>('/autodrome-agreements/index-agreements')

  const rows = asArray<AgreementRow>(res.data)
  const map = new Map<number, { id: number; name?: string | null; inn?: string | null }>()
  for (const row of rows) {
    const a = row.autodrome
    if (a?.id && !map.has(a.id)) {
      map.set(a.id, { id: a.id, name: a.name, inn: a.inn })
    }
  }

  const autodromes = Array.from(map.values())
  const withCams = await Promise.all(
    autodromes.map(async (a) => {
      try {
        const cr = await apiClientV2.get<{
          status?: number
          data?: unknown
        }>(`/autodrome-agreements/cameras/${a.id}?show_count=200`)
        return {
          ...a,
          cameras: asArray<AutodromeCameraItem>(cr.data),
        }
      } catch {
        return { ...a, cameras: [] }
      }
    }),
  )

  return withCams
}

export { todayIso }
