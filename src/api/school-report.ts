import { apiClient, apiClientV2, withAccessToken } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type {
  SchoolReportGroup,
  SchoolReportGroupList,
  SchoolReportLesson,
  SchoolReportList,
  SchoolReportMark,
  SchoolReportMonitoring,
  SchoolReportRow,
  SchoolReportStudent,
  SchoolReportTotals,
} from '@/types/school-report'

export type SchoolReportArgs = {
  page: number
  showCount: number
  regionId?: string
  areaId?: string
}

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const raw = String(value).trim()
  if (!raw || raw === 'null' || raw === 'undefined') return ''
  return raw
}

function accept(res: Record<string, unknown>) {
  const code = Number(res.response_code)
  const success = res.success === true || code === 200 || code === 201
  const failed = res.status === 0 || res.status === false || res.status === '0'
  if (failed && !success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
}

function rowsOf(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const box = asRecord(value)
  if (Array.isArray(box.data)) return box.data
  return []
}

function idOf(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function reportRow(value: unknown): SchoolReportRow | null {
  const row = asRecord(value)
  const org = asRecord(row.organization)
  const director = asRecord(row.director)
  const region = asRecord(org.region)
  const id = num(org.id)
  if (!id) return null
  const fio = text(director.fio)
  const name = [text(director.last_name), text(director.first_name), text(director.middle_name)]
    .filter(Boolean)
    .join(' ')
  return {
    id,
    regionId: idOf(region.id) ?? idOf(org.region_id) ?? idOf(row.region_id),
    name: text(org.name),
    inn: text(org.inn),
    director: fio || name,
    teachers: num(row.teachers_count),
    cars: num(row.cars_count),
    groups: num(row.active_groups_count),
    students: num(row.active_students_count),
  }
}

/** GET v2 /inspector/report-by-organizations — faqat faol rejim. */
export async function fetchSchoolReport(args: SchoolReportArgs): Promise<SchoolReportList> {
  const filters: FilterItem[] = [
    { fieldKey: 'operating_mode_id', fieldOperator: '=', fieldValue: '1' },
  ]
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra: {
      region_id: args.regionId || undefined,
      area_id: args.areaId || undefined,
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/inspector/report-by-organizations?${query}`,
  )
  accept(res)
  const box = asRecord(res.data)
  const raw = rowsOf(res.data)
  const rows = raw.map(reportRow).filter((row): row is SchoolReportRow => row != null)
  const total = num(box.total ?? box.total_items ?? res.total ?? rows.length)
  return { rows, total }
}

/** Eski kartalar: GET v2 /daily-rs-report/index-organization, kecha. */
export async function fetchSchoolReportTotals(args: {
  date: string
  regionId?: string
  areaId?: string
}): Promise<SchoolReportTotals> {
  const filters: FilterItem[] = []
  if (args.regionId) {
    filters.push({ fieldKey: 'region_id', fieldOperator: '=', fieldValue: args.regionId })
  }
  if (args.areaId) {
    filters.push({ fieldKey: 'area_id', fieldOperator: '=', fieldValue: args.areaId })
  }
  const query = buildListQuery({
    page: 1,
    show_count: 5000,
    filters,
    extra: { date: args.date },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/daily-rs-report/index-organization?${query}`,
  )
  accept(res)
  const box = asRecord(res.data)
  const raw = rowsOf(res.data)
  const schools = num(box.total_items ?? box.total) || raw.length
  return {
    schools,
    groups: raw.reduce((sum, item) => sum + num(asRecord(item).active_groups_count), 0),
    students: raw.reduce((sum, item) => sum + num(asRecord(item).active_students_count), 0),
  }
}

function optionalNum(value: unknown) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function groupRow(value: unknown): SchoolReportGroup | null {
  const row = asRecord(value)
  const id = idOf(row.id)
  if (!id) return null
  const report = asRecord(row.inspection_group_report)
  return {
    id,
    name: text(row.name_uz) || text(row.name),
    start: text(row.edu_starting_date),
    end: text(row.edu_ending_date),
    students: num(row.students_count),
    average: optionalNum(report.average_attendance),
    lastLessonDate: text(report.last_lesson_date),
    lastAbsence: optionalNum(report.last_lesson_absence_count),
  }
}

/** GET v1 /inspection-monitoring/groups */
export async function fetchSchoolReportGroups(args: {
  organizationId: string
  page: number
  showCount: number
  word: string
}): Promise<SchoolReportGroupList> {
  const params = new URLSearchParams({
    organization_id: args.organizationId,
    show_count: String(args.showCount),
    page: String(args.page),
    word: args.word,
  })
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/inspection-monitoring/groups?${params.toString()}`),
  )
  const status = res.status
  const ok = status === 1 || status === '1' || Number(res.response_code) === 200
  const box = asRecord(res.data)
  const raw = rowsOf(box.data ?? res.data)
  if (!ok && raw.length === 0) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  const rows = raw.map(groupRow).filter((row): row is SchoolReportGroup => row != null)
  return {
    rows: rows.reverse(),
    total: num(box.total ?? box.total_items ?? rows.length),
  }
}

function lessonOf(value: unknown): SchoolReportLesson | null {
  const row = asRecord(value)
  const id = text(row.id)
  if (!id) return null
  return {
    id,
    start: text(row.start_time),
    end: text(row.end_time),
    average: num(row.average_attendance),
  }
}

function markOf(value: unknown): SchoolReportMark {
  const row = asRecord(value)
  return {
    type: num(row.type),
    value: text(row.value),
    image: text(row.current_image),
  }
}

function studentOf(value: unknown): SchoolReportStudent | null {
  const row = asRecord(value)
  const id = idOf(row.id)
  if (!id) return null
  const marks: Record<string, SchoolReportMark> = {}
  for (const [key, mark] of Object.entries(asRecord(row.mark_monitoring))) {
    marks[key] = markOf(mark)
  }
  const name = [text(row.last_name), text(row.first_name), text(row.middle_name)]
    .filter(Boolean)
    .join(' ')
  return { id, name, marks }
}

/** GET v1 /inspection-monitoring/monitoring?group_id= */
export async function fetchSchoolReportMonitoring(groupId: string): Promise<SchoolReportMonitoring> {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/inspection-monitoring/monitoring?group_id=${encodeURIComponent(groupId)}`),
  )
  const lessons = rowsOf(res.data).map(lessonOf).filter((row): row is SchoolReportLesson => row != null)
  const students = rowsOf(res.students).map(studentOf).filter((row): row is SchoolReportStudent => row != null)
  if (!lessons.length && !students.length && (res.status === 0 || res.status === '0' || res.status === false)) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Request failed')
  }
  return { lessons, students }
}
