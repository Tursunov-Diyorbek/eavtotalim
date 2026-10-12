import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import type { ScheduleGroup, WeekDaySlot } from '@/types/autodrome-week-schedule'

type Envelope = {
  status?: number | boolean | string
  response_code?: number | string
  success?: boolean
  message?: string
  data?: unknown
}

function accept(res: Envelope) {
  const code = Number(res.response_code)
  if (code === 200 || code === 201 || res.success) return
  assertOk(res)
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

function asWeekDays(payload: unknown): WeekDaySlot[] {
  const body = (payload ?? {}) as Envelope
  const data = body.data
  if (Array.isArray(data)) return data as WeekDaySlot[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: WeekDaySlot[] }).data
  }
  return []
}

function readPage(payload: unknown, page: number, showCount: number) {
  const parsed = unwrapPage<ScheduleGroup>(payload, page, showCount)
  const body = (payload ?? {}) as Envelope
  const nested = body.data
  const totalPages =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? Number((nested as { total_pages?: number }).total_pages)
      : 0
  if (totalPages > parsed.last_page) return { ...parsed, last_page: totalPages }
  return parsed
}

/** GET v2 `/autodrome-organization-groups/by-weekdays` */
export async function fetchAutodromeWeekDays() {
  const res = await apiClientV2.get<Envelope>('/autodrome-organization-groups/by-weekdays')
  accept(res)
  return asWeekDays(res)
}

export type ScheduleListFilters = {
  page: number
  showCount: number
  word?: string
  organizationInn?: string
  /** `marked` | `unmarked` */
  isWeekdays?: string
  notInDay?: number
}

/** GET v2 `/autodrome-organization-groups/by-list` */
export async function fetchScheduleGroups(filters: ScheduleListFilters) {
  const query = qs({
    page: filters.page,
    show_count: filters.showCount,
    word: filters.word?.trim(),
    organization_inn: filters.organizationInn?.trim(),
    is_weekdays: filters.isWeekdays,
    not_in_day: filters.notInDay,
  })
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-organization-groups/by-list${query}`,
  )
  accept(res)
  return readPage(res, filters.page, filters.showCount)
}

export type AttachedGroupFilters = {
  day: number
  part?: number | null
  page: number
  showCount: number
  word?: string
  organizationInn?: string
}

/** GET v2 `/autodrome-organization-groups/show-groups` */
export async function fetchAttachedScheduleGroups(filters: AttachedGroupFilters) {
  const query = qs({
    day: filters.day,
    part: filters.part,
    page: filters.page,
    show_count: filters.showCount,
    word: filters.word?.trim(),
    organization_inn: filters.organizationInn?.trim(),
  })
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-organization-groups/show-groups${query}`,
  )
  accept(res)
  return readPage(res, filters.page, filters.showCount)
}

export async function attachGroupToWeekday(payload: {
  group_id: number
  day: number
  part: number
}) {
  const res = await apiClientV2.post<Envelope>(
    '/autodrome-organization-groups/attach-to-weekday',
    payload,
  )
  accept(res)
  return res
}

export async function detachGroupFromWeekday(payload: { group_id: number; day: number }) {
  const res = await apiClientV2.post<Envelope>(
    '/autodrome-organization-groups/detach-from-weekday',
    payload,
  )
  accept(res)
  return res
}

export async function updateGroupWeekSchedule(payload: {
  group_id: number
  days: { day: number; part: number }[]
}) {
  const res = await apiClientV2.put<Envelope>(
    '/autodrome-organization-groups/update-schedule',
    payload,
  )
  accept(res)
  return res
}
