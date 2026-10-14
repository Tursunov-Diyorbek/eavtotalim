import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import { getAccessToken } from '@/lib/authStorage'
import type {
  AutodromeAttendancePage,
  AutodromeAttendanceStudent,
  AutodromeGroupRow,
  AutodromeOrganizationStudent,
  AutodromeResGaiRow,
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
  /** `''` — barchasi. Eski `group_status`: 0 Yangi, 1 Faol, 2 Tamomlagan. */
  groupStatus: string
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

function isEduStatus(value: string) {
  return value === '0' || value === '1' || value === '2'
}

function matchesEduStatus(row: AutodromeGroupRow, status: string) {
  return String(row.edu_status ?? '') === status
}

function slicePage(rows: AutodromeGroupRow[], page: number, showCount: number) {
  const start = (page - 1) * showCount
  return {
    data: rows.slice(start, start + showCount),
    total_items: rows.length,
    current_page: page,
    last_page: Math.max(1, Math.ceil(rows.length / showCount) || 1),
  }
}

async function loadGroups(
  args: GroupsArgs,
  page: number,
  showCount: number,
  word = args.autodromeInn.trim(),
  withStatus = true,
) {
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('show_count', String(showCount))
  const groupName = args.groupName.trim()
  if (groupName) sp.set('group_name', groupName)
  if (word) sp.set('word', word)
  if (withStatus && isEduStatus(args.groupStatus)) sp.set('group_status', args.groupStatus)
  if (args.sortBy) sp.set('sort_by', args.sortBy)
  if (args.sortOrder) sp.set('sort_order', args.sortOrder)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-organization-groups/list?${sp}`,
  )
  assertOk(res)
  return unwrapPage<AutodromeGroupRow>(res, page, showCount)
}

async function loadEvery(args: GroupsArgs, word: string) {
  let rows: AutodromeGroupRow[] = []
  for (let page = 1; page <= WIDE_MAX_PAGES; page += 1) {
    const chunk = await loadGroups(args, page, WIDE_SHOW_COUNT, word, false)
    rows = rows.concat(chunk.data)
    if (page >= (chunk.last_page ?? 1) || chunk.data.length < WIDE_SHOW_COUNT) break
  }
  return rows
}

export async function fetchAutodromeOrganizationGroups(args: GroupsArgs) {
  const inn = args.autodromeInn.trim()
  const status = isEduStatus(args.groupStatus) ? args.groupStatus : ''
  let word = inn
  let first: Awaited<ReturnType<typeof loadGroups>>
  try {
    first = await loadGroups(args, args.page, args.showCount, word, true)
  } catch {
    if (inn) word = ''
    first = await loadGroups(args, args.page, args.showCount, word, false)
  }

  const statusOk = !status || first.data.every((row) => matchesEduStatus(row, status))
  const innOk = !word || (first.data.length > 0 && first.data.every((row) => rowMatches(row, inn)))
  if (statusOk && innOk) return first

  // `group_status` ba’zi javoblarda qo‘llanmaydi — sahifalab olib, shu yerda kesamiz.
  let rows: AutodromeGroupRow[] = []
  try {
    rows = await loadEvery(args, word)
  } catch {
    if (!rows.length) rows = first.data
  }
  if (inn) rows = rows.filter((row) => rowMatches(row, inn))
  if (status) rows = rows.filter((row) => matchesEduStatus(row, status))
  return { ...first, ...slicePage(rows, args.page, args.showCount) }
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

/**
 * GAI avtodrom davomati.
 * Eski `getAutodromeOrganizationGroupsResGai`:
 * `student_search`, `group_status` (0 yangi, 1 faol, 2 tugatilgan), `organization_search`.
 */
export async function fetchAutodromeResGaiReport(args: {
  page: number
  showCount: number
  studentSearch: string
  organizationSearch: string
  groupStatus: string
}) {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('group_status', args.groupStatus)
  const student = args.studentSearch.trim()
  const organization = args.organizationSearch.trim()
  if (student) sp.set('student_search', student)
  if (organization) sp.set('organization_search', organization)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/autodrome-student-attendances/report?${sp}`,
  )
  assertOk(res)
  const page = unwrapPage<AutodromeResGaiRow>(res, args.page, args.showCount)
  const body = res
  const nested = body.data
  const box =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : body
  const totalPages = Number(box.total_pages)
  if (totalPages > 0) return { ...page, last_page: totalPages }
  return page
}
