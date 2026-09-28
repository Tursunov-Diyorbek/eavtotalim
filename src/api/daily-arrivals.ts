import { apiClientV2 } from './client'
import {
  asFio,
  assertOk,
  buildListQuery,
  unwrapPage,
  type ApiPage,
  type FilterItem,
} from '@/lib/apiPage'
import type { DailyArrival } from '@/types/daily-arrivals'

const WIDE = 2000

type ArrivalQuery = {
  page: number
  showCount: number
  fio: string
  groupId: string
  groupName?: string
  date: string
}

function dayOf(row: DailyArrival) {
  const raw = row.attendance_date || row.date || ''
  return raw.slice(0, 10)
}

function fioOf(row: DailyArrival) {
  const named = asFio(row)
  if (named !== '—') return named
  return (
    row.full_name?.trim() ||
    row.student_fullname?.trim() ||
    row.fio?.trim() ||
    row.student?.full_name?.trim() ||
    ''
  )
}

function groupIds(row: DailyArrival) {
  return [row.group_id, row.group?.id, row.student?.group_id, row.student?.group?.id]
    .filter((id) => id != null && id !== '')
    .map(String)
}

function groupNames(row: DailyArrival) {
  return [
    row.group?.name_uz,
    row.group?.name,
    row.group_name,
    row.student?.group?.name_uz,
    row.student?.group?.name,
  ]
    .map((name) => name?.trim().toLocaleLowerCase('uz') || '')
    .filter(Boolean)
}

function matches(row: DailyArrival, args: ArrivalQuery) {
  const fio = args.fio.trim().toLocaleLowerCase('uz')
  if (fio && !fioOf(row).toLocaleLowerCase('uz').includes(fio)) return false
  if (args.date && dayOf(row) !== args.date) return false
  if (args.groupId) {
    const ids = groupIds(row)
    const names = groupNames(row)
    if (!ids.length && !names.length) return true
    if (ids.includes(args.groupId)) return true
    const label = args.groupName?.trim().toLocaleLowerCase('uz')
    if (label && names.some((name) => name === label || name.includes(label))) return true
    return false
  }
  return true
}

function slicePage(rows: DailyArrival[], page: number, showCount: number): ApiPage<DailyArrival> {
  const start = (page - 1) * showCount
  return {
    data: rows.slice(start, start + showCount),
    total_items: rows.length,
    current_page: page,
    last_page: Math.max(1, Math.ceil(rows.length / showCount) || 1),
  }
}

/** `{ data: { data: rows } }` va undan chuqurroq ro‘yxatni ochadi. */
function extractPage(payload: unknown, page: number, showCount: number): ApiPage<DailyArrival> {
  const standard = unwrapPage<DailyArrival>(payload, page, showCount)
  if (standard.data.length) return standard

  let node: unknown = payload
  let bag: Record<string, unknown> | null = null
  for (let depth = 0; depth < 6; depth++) {
    if (Array.isArray(node)) {
      const rows = node as DailyArrival[]
      const total = Number(bag?.total_items ?? bag?.total ?? rows.length) || rows.length
      return {
        data: rows,
        total_items: total,
        current_page: Number(bag?.current_page ?? page) || page,
        last_page:
          Number(bag?.last_page) || Math.max(1, Math.ceil(total / showCount) || 1),
      }
    }
    if (!node || typeof node !== 'object') break
    const rec = node as Record<string, unknown>
    bag = rec
    const next = rec.data ?? rec.items ?? rec.students ?? rec.attendances ?? rec.rows
    if (next === undefined) break
    node = next
  }
  return standard
}

const RELATIONS = ['student', 'group', 'organization'] as const

function indexedRelations() {
  const extra: Record<string, string> = {}
  RELATIONS.forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  return extra
}

async function loadArrivals(
  args: ArrivalQuery,
  withFilters: boolean,
  groupField: 'group_id' | 'student.group_id' = 'group_id',
) {
  const filters: FilterItem[] = []
  if (withFilters && args.groupId) {
    filters.push({
      fieldKey: groupField,
      fieldOperator: '=',
      fieldValue: args.groupId,
    })
  }
  if (withFilters && args.date) {
    filters.push({
      fieldKey: 'attendance_date',
      fieldOperator: 'LIKE',
      fieldValue: `%${args.date}%`,
    })
  }
  const fio = args.fio.trim()
  const query = buildListQuery({
    page: 1,
    show_count: withFilters || fio || args.groupId || args.date ? WIDE : args.showCount,
    filters,
    extra: {
      fio: fio || undefined,
      word: fio || undefined,
      student_search: fio || undefined,
      group_id: args.groupId || undefined,
      date: args.date || undefined,
      attendance_date: args.date || undefined,
      ...indexedRelations(),
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/monitoring-camera/index-daily-attendance?${query}`,
  )
  try {
    assertOk(res)
    const parsed = extractPage(res, 1, WIDE)
    if (parsed.data.length) return parsed
  } catch {
    // relation yoki filtr so‘rovi yiqilsa — oddiy ro‘yxat
  }
  const plain = buildListQuery({
    page: 1,
    show_count: WIDE,
    extra: { relations: JSON.stringify(['student']) },
  })
  const retry = await apiClientV2.get<Record<string, unknown>>(
    `/monitoring-camera/index-daily-attendance?${plain}`,
  )
  assertOk(retry)
  return extractPage(retry, 1, WIDE)
}

/** GET v2 /monitoring-camera/index-daily-attendance */
export async function fetchDailyArrivals(args: ArrivalQuery) {
  const filtering = Boolean(args.fio.trim() || args.groupId || args.date)
  if (!filtering) {
    const query = buildListQuery({
      page: args.page,
      show_count: args.showCount,
      extra: indexedRelations(),
    })
    const res = await apiClientV2.get<Record<string, unknown>>(
      `/monitoring-camera/index-daily-attendance?${query}`,
    )
    try {
      assertOk(res)
      const parsed = extractPage(res, args.page, args.showCount)
      if (parsed.data.length) return parsed
    } catch {
      // relation so‘rovi yiqilsa — oddiy ro‘yxat
    }
    const plain = buildListQuery({
      page: args.page,
      show_count: args.showCount,
      extra: { relations: JSON.stringify(['student']) },
    })
    const retry = await apiClientV2.get<Record<string, unknown>>(
      `/monitoring-camera/index-daily-attendance?${plain}`,
    )
    assertOk(retry)
    return extractPage(retry, args.page, args.showCount)
  }

  let rows: DailyArrival[] = []
  try {
    const filtered = await loadArrivals(args, true)
    const serverArgs = { ...args, fio: '' }
    const honored =
      filtered.data.length > 0 &&
      filtered.data.every((row) => matches(row, serverArgs))
    rows = honored ? filtered.data : (await loadArrivals(args, false)).data
    if (
      args.groupId &&
      rows.length > 0 &&
      !rows.some((row) => groupIds(row).length || groupNames(row).length)
    ) {
      const byStudent = await loadArrivals(args, true, 'student.group_id')
      if (byStudent.data.length > 0 && byStudent.data.length < rows.length) {
        rows = byStudent.data
      }
    }
  } catch {
    const wide = await loadArrivals(args, false)
    rows = wide.data
  }

  return slicePage(
    rows.filter((row) => matches(row, args)),
    args.page,
    args.showCount,
  )
}

/** Shu kunning kamera kelishlarini qayta olish */
export async function refetchDailyArrivals(date: string, groupId?: string) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/monitoring-camera/get-again-daily-attendance', {
    date,
    group_id: groupId || undefined,
  })
  assertOk(res)
  return res
}
