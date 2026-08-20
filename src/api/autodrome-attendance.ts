import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import type {
  AutodromeAttendancePage,
  AutodromeAttendanceStudent,
  AutodromeGroupRow,
} from '@/types/autodrome-attendance'

export type AutodromeGroupSortBy = 'created_at' | 'attended_students_count'

export async function fetchAutodromeOrganizationGroups(args: {
  page: number
  showCount: number
  groupName: string
  autodromeSearch: string
  sortBy: AutodromeGroupSortBy
  sortOrder: 'asc' | 'desc'
}) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  const groupName = args.groupName.trim()
  const word = args.autodromeSearch.trim()
  if (groupName) sp.set('group_name', groupName)
  if (word) sp.set('word', word)
  if (args.sortBy) sp.set('sort_by', args.sortBy)
  if (args.sortOrder) sp.set('sort_order', args.sortOrder)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-organization-groups/list?${sp}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeGroupRow>(res, args.page, args.showCount)
}

export async function fetchAutodromeStudentAttendances(args: {
  groupId: string
  month: number
  year: number
  search: string
}): Promise<AutodromeAttendancePage> {
  const sp = new URLSearchParams()
  sp.set('group_id', args.groupId)
  sp.set('month', String(args.month))
  sp.set('year', String(args.year))
  const search = args.search.trim()
  if (search) sp.set('search', search)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-student-attendances/index?${sp}`,
  )
  assertOk(res)
  return unwrapAttendancePage(res)
}

function asMeta(value: unknown): { dates: string[]; total: number } {
  if (!value || typeof value !== 'object') return { dates: [], total: 0 }
  const rec = value as Record<string, unknown>
  const dates = Array.isArray(rec.dates)
    ? rec.dates.filter((item): item is string => typeof item === 'string')
    : []
  const total = Number(rec.total ?? rec.total_items ?? 0) || 0
  return { dates, total }
}

function unwrapAttendancePage(payload: unknown): AutodromeAttendancePage {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  if (Array.isArray(nested)) {
    const meta = asMeta(body.meta)
    return {
      data: nested as AutodromeAttendanceStudent[],
      dates: meta.dates,
      total: meta.total || nested.length,
    }
  }
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>
    const list = Array.isArray(inner.data)
      ? (inner.data as AutodromeAttendanceStudent[])
      : []
    const meta = asMeta(inner.meta ?? body.meta)
    return {
      data: list,
      dates: meta.dates,
      total: meta.total || list.length,
    }
  }
  return { data: [], dates: [], total: 0 }
}
