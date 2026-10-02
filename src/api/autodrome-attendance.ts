import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import { getAccessToken } from '@/lib/authStorage'
import type {
  AutodromeAttendancePage,
  AutodromeAttendanceStudent,
  AutodromeGroupRow,
  AutodromeOrganizationStudent,
} from '@/types/autodrome-attendance'

type Envelope = { status?: number | boolean | string; message?: string }

/** Kameraga ulangan o‘quvchilar — eski `autodromeOrganizationStudentsList`. */
export async function fetchAutodromeOrganizationStudents(args: {
  groupId: string
  word: string
  page: number
  showCount: number
}) {
  const sp = new URLSearchParams()
  sp.set('group_id', args.groupId)
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  const word = args.word.trim()
  if (word) sp.set('word', word)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-organization-students/list?${sp}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeOrganizationStudent>(res, args.page, args.showCount)
}

/** Eski frontend `token` ni body da ham yuboradi. */
function tokenForm() {
  const form = new FormData()
  const token = getAccessToken()
  if (token) form.append('token', token)
  return form
}

export async function updateAutodromeStudentImage(studentId: number, image: File) {
  const form = tokenForm()
  form.append('image', image)
  const res = await apiClientV2.postForm<Envelope>(
    `/autodrome-organization-students/update-image/${studentId}`,
    form,
  )
  assertOk(res)
  return res
}

export async function returnAutodromeStudentRealImage(studentId: number) {
  const res = await apiClientV2.postForm<Envelope>(
    `/autodrome-organization-students/return-real-image/${studentId}`,
    tokenForm(),
  )
  assertOk(res)
  return res
}

export async function resendAutodromeOrganizationStudent(studentId: number) {
  const res = await apiClientV2.postForm<Envelope>(
    `/autodrome-organization-students/resend-autodrome-organization-student/${studentId}`,
    tokenForm(),
  )
  assertOk(res)
  return res
}

export type AutodromeGroupSortBy = 'created_at' | 'attended_students_count'

type GroupsArgs = {
  page: number
  showCount: number
  groupName: string
  /** Avtodrom INN (`OrganizationSelect source="autodromes"`) — eski sahifadagidek `word` */
  autodromeInn: string
  sortBy: AutodromeGroupSortBy
  sortOrder: 'asc' | 'desc'
}

/** Katta `show_count` (1000) backendda «Validation failed» beradi. */
const WIDE_SHOW_COUNT = 100
const WIDE_MAX_PAGES = 10

function rowMatches(row: AutodromeGroupRow, value: string) {
  const autodrome = row.autodrome
  if (String(autodrome?.inn ?? '').trim() === value) return true
  const name = String(autodrome?.name ?? '').trim().toLowerCase()
  return Boolean(name) && name === value.toLowerCase()
}

async function loadGroups(
  args: GroupsArgs,
  page: number,
  showCount: number,
  word = args.autodromeInn.trim(),
) {
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('show_count', String(showCount))
  const groupName = args.groupName.trim()
  if (groupName) sp.set('group_name', groupName)
  if (word) sp.set('word', word)
  if (args.sortBy) sp.set('sort_by', args.sortBy)
  if (args.sortOrder) sp.set('sort_order', args.sortOrder)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-organization-groups/list?${sp}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeGroupRow>(res, page, showCount)
}

export async function fetchAutodromeOrganizationGroups(args: GroupsArgs) {
  const inn = args.autodromeInn.trim()
  if (!inn) return loadGroups(args, args.page, args.showCount)

  let word = inn
  let first: Awaited<ReturnType<typeof loadGroups>>
  try {
    first = await loadGroups(args, args.page, args.showCount, word)
  } catch {
    word = ''
    first = await loadGroups(args, args.page, args.showCount, word)
  }
  if (word && first.data.length && first.data.every((row) => rowMatches(row, inn))) return first

  // `word` avtomaktab bo‘yicha ham mos keladi — keng olib, klientda avtodrom bo‘yicha filtrlanadi.
  let rows: AutodromeGroupRow[] = []
  try {
    for (let page = 1; page <= WIDE_MAX_PAGES; page += 1) {
      const chunk = await loadGroups(args, page, WIDE_SHOW_COUNT, word)
      rows = rows.concat(chunk.data)
      if (page >= (chunk.last_page ?? 1) || chunk.data.length < WIDE_SHOW_COUNT) break
    }
  } catch {
    if (!rows.length) rows = first.data
  }
  const matched = rows.filter((row) => rowMatches(row, inn))
  const start = (args.page - 1) * args.showCount
  return {
    ...first,
    data: matched.slice(start, start + args.showCount),
    total_items: matched.length,
    last_page: Math.max(1, Math.ceil(matched.length / args.showCount)),
  }
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
