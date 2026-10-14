import { apiClientV2 } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type {
  DailyAttendanceList,
  DailyAttendanceRow,
  DailyAttendanceTypeRow,
} from '@/types/daily-attendance'

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function text(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function percent(value: unknown) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function idOf(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function unpack(body: unknown) {
  const root = rec(body)
  const failed = root.status === 0 || root.status === false || root.status === '0'
  const level = root.data
  const rows = Array.isArray(level)
    ? level.map(rec)
    : Array.isArray(rec(level).data)
      ? (rec(level).data as unknown[]).map(rec)
      : []
  if (failed && rows.length === 0) {
    throw new Error(typeof root.message === 'string' ? root.message : 'Request failed')
  }
  const nested = rec(level)
  const total = Number(nested.total_items ?? root.total_items ?? rows.length) || rows.length
  return { rows, total }
}

function kirilOf(entity: Record<string, unknown>) {
  const lang = rec(entity.lang)
  return text(lang.kiril) || text(entity.name) || text(entity.name_uz)
}

function countRow(value: Record<string, unknown>, kind: 'region' | 'area' | 'org'): DailyAttendanceRow {
  const region = rec(value.region)
  const area = rec(value.area)
  const org = rec(value.organization)
  const entity = kind === 'region' ? region : kind === 'area' ? area : org
  return {
    name: text(entity.name) || text(entity.name_uz),
    kiril: kirilOf(kind === 'org' ? org : entity),
    regionId: idOf(region.id),
    orgId: idOf(org.id),
    activeSchools: num(value.active_organizations_count),
    allSchools: num(value.all_organizations_count),
    lessonGroups: num(value.today_has_lesson_groups_count),
    activeGroups: num(value.active_groups_count),
    lessonStudents: num(value.today_has_lesson_students_count),
    activeStudents: num(value.active_students_count),
    absent: num(value.absent_students_count),
    absentPercent: percent(value.absent_percent),
    monitoringPercent: percent(value.monitoring_percent),
  }
}

function typeRow(value: Record<string, unknown>): DailyAttendanceTypeRow {
  const org = rec(value.superior_organization)
  return {
    name: text(org.name) || text(org.name_uz),
    organizations: num(value.organizations_count),
    activeOrganizations: num(value.active_organizations_count),
    activeGroups: num(value.active_groups_count),
    lessonGroups: num(value.today_has_lesson_groups_count),
    activeStudents: num(value.active_students_count),
    lessonStudents: num(value.today_has_lesson_students_count),
    absent: num(value.absent_students_count),
    monitoringPercent: percent(value.monitoring_percent),
    absentPercent: percent(value.absent_percent),
  }
}

async function load(path: string) {
  const res = await apiClientV2.get<unknown>(path)
  return unpack(res)
}

function queryOf(date: string, filters: FilterItem[]) {
  return buildListQuery({ extra: { date }, filters })
}

/** GET v2 `/daily-rs-report/index-region` */
export async function fetchDailyAttendanceByRegion(
  date: string,
  regionId?: string,
): Promise<DailyAttendanceList<DailyAttendanceRow>> {
  const filters: FilterItem[] = regionId
    ? [{ fieldKey: 'region_id', fieldOperator: '=', fieldValue: regionId }]
    : []
  const { rows, total } = await load(`/daily-rs-report/index-region?${queryOf(date, filters)}`)
  return { rows: rows.map((row) => countRow(row, 'region')), total }
}

/** GET v2 `/daily-rs-report/index-area` */
export async function fetchDailyAttendanceByArea(
  date: string,
  regionId?: string,
): Promise<DailyAttendanceList<DailyAttendanceRow>> {
  const filters: FilterItem[] = regionId
    ? [{ fieldKey: 'region_id', fieldOperator: '=', fieldValue: regionId }]
    : []
  const { rows, total } = await load(`/daily-rs-report/index-area?${queryOf(date, filters)}`)
  return { rows: rows.map((row) => countRow(row, 'area')), total }
}

/** GET v2 `/daily-rs-report/index-organization` */
export async function fetchDailyAttendanceByOrganization(
  date: string,
  filters: FilterItem[],
): Promise<DailyAttendanceList<DailyAttendanceRow>> {
  const { rows, total } = await load(
    `/daily-rs-report/index-organization?${queryOf(date, filters)}`,
  )
  return { rows: rows.map((row) => countRow(row, 'org')), total }
}

/** GET v2 `/daily-rs-report/index-superior` */
export async function fetchDailyAttendanceByType(
  date: string,
): Promise<DailyAttendanceList<DailyAttendanceTypeRow>> {
  const { rows, total } = await load(`/daily-rs-report/index-superior?${queryOf(date, [])}`)
  return { rows: rows.map(typeRow), total }
}

/** GET v2 `/inspector/get-statistics` — turlar filtri */
export async function fetchDailyAttendanceTypes() {
  const res = await apiClientV2.get<unknown>('/inspector/get-statistics')
  const root = rec(res)
  const level = rec(root.data)
  const list = Array.isArray(level.superior_organizations)
    ? level.superior_organizations
    : Array.isArray(rec(level.data).superior_organizations)
      ? (rec(level.data).superior_organizations as unknown[])
      : []
  return list.map(rec).flatMap((item) => {
    const id = idOf(item.id)
    const name = text(item.name) || text(item.name_uz)
    return id && name ? [{ id: String(id), name }] : []
  })
}
