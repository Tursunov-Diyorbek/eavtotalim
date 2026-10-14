import { apiClientV2 } from './client'
import { buildListQuery } from '@/lib/apiPage'
import type { StudentRegionEduType, StudentRegionReport, StudentRegionRow } from '@/types/student-region-report'

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function text(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function idOf(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function num(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function rowsOf(res: unknown) {
  const body = rec(res)
  const failed = body.status === 0 || body.status === false || body.status === '0'
  const code = Number(body.response_code)
  const ok =
    code === 200 ||
    code === 201 ||
    body.success === true ||
    body.status === 1 ||
    body.status === '1' ||
    body.status == null
  if (Array.isArray(body.data)) return body.data.map(rec)
  const nested = rec(body.data)
  if (Array.isArray(nested.data)) return nested.data.map(rec)
  if (failed && !ok) {
    throw new Error(typeof body.message === 'string' ? body.message : 'Request failed')
  }
  return []
}

function typeName(row: Record<string, unknown>) {
  const type = rec(row.edu_type)
  return (
    text(row.character_name) ||
    text(type.character_name) ||
    text(row.short_name) ||
    text(type.short_name) ||
    text(type.name) ||
    text(row.name)
  )
}

function shortName(row: Record<string, unknown>) {
  const type = rec(row.edu_type)
  return text(row.short_name) || text(type.short_name) || typeName(row)
}

function eduTypesOf(res: unknown): StudentRegionEduType[] {
  return rowsOf(res)
    .map((row) => ({ id: idOf(row.id), name: typeName(row), shortName: shortName(row) }))
    .filter((type) => type.name || type.id != null)
}

function fallbackTypes(rows: Record<string, unknown>[]): StudentRegionEduType[] {
  for (const row of rows) {
    const reports = listOf(row.report_by_edu_types)
    if (!reports.length) continue
    return reports.map((item) => {
      const report = rec(item)
      return {
        id: idOf(report.edu_type_id) ?? idOf(rec(report.edu_type).id),
        name: typeName(report),
        shortName: shortName(report),
      }
    })
  }
  return []
}

function countOf(reports: unknown[], type: StudentRegionEduType, field: string) {
  const found =
    type.id != null
      ? reports.find((item) => Number(rec(item).edu_type_id) === type.id)
      : undefined
  return num(rec(found)[field])
}

function sumField(reports: unknown[], field: string) {
  return reports.reduce((total, item) => total + num(rec(item)[field]), 0)
}

function mapRows(
  rows: Record<string, unknown>[],
  types: StudentRegionEduType[],
  level: 'region' | 'area' | 'org',
): StudentRegionRow[] {
  return rows.map((row) => {
    const entity = rec(level === 'region' ? row.region : level === 'area' ? row.area : row.organization)
    const reports = listOf(row.report_by_edu_types)
    const eduGroups = sumField(reports, 'active_groups_count')
    return {
      id: idOf(entity.id),
      name: text(entity.name) || text(entity.name_uz) || text(entity.name_ru),
      schools: num(row.active_organizations_count),
      groupCount: num(row.active_groups_count),
      groupsByEdu: types.map((type) => countOf(reports, type, 'active_groups_count')),
      groups: level === 'region' ? num(row.active_groups_count) : eduGroups,
      eduGroups,
      studentsTotal: sumField(reports, 'active_students_count'),
      students: types.map((type) => countOf(reports, type, 'active_students_count')),
    }
  })
}

async function load(path: string, level: 'region' | 'area' | 'org'): Promise<StudentRegionReport> {
  const [reportRes, typesRes] = await Promise.all([
    apiClientV2.get<unknown>(path),
    apiClientV2.get<unknown>('/region-safety/edu-types').catch(() => null),
  ])
  const rows = rowsOf(reportRes)
  const eduTypes = typesRes ? eduTypesOf(typesRes) : []
  const types = eduTypes.length ? eduTypes : fallbackTypes(rows)
  return { eduTypes: types, rows: mapRows(rows, types, level) }
}

/** GET v2 `/region-safety/organization-student-counts/report-by-region` */
export function fetchStudentReportByRegion() {
  return load('/region-safety/organization-student-counts/report-by-region', 'region')
}

/** GET v2 `/region-safety/organization-student-counts/report-by-area` */
export function fetchStudentReportByArea(regionId: string) {
  const query = buildListQuery({
    filters: [{ fieldKey: 'region_id', fieldOperator: '=', fieldValue: regionId }],
  })
  return load(`/region-safety/organization-student-counts/report-by-area?${query}`, 'area')
}

/** GET v2 `/region-safety/organization-student-counts/report-by-organization` */
export function fetchStudentReportByOrganization(areaId: string) {
  const query = buildListQuery({
    filters: [{ fieldKey: 'area_id', fieldOperator: '=', fieldValue: areaId }],
  })
  return load(`/region-safety/organization-student-counts/report-by-organization?${query}`, 'org')
}

/** Guruhlar hisoboti: shu endpoint, qo‘shimcha `edu_status = 1`. */
export function fetchGroupReportByOrganization(areaId: string) {
  const query = buildListQuery({
    filters: [
      { fieldKey: 'area_id', fieldOperator: '=', fieldValue: areaId },
      { fieldKey: 'edu_status', fieldOperator: '=', fieldValue: 1 },
    ],
  })
  return load(`/region-safety/organization-student-counts/report-by-organization?${query}`, 'org')
}
