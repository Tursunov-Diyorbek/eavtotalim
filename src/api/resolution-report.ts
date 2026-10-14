import { apiClientV2 } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type { ResolutionCountRow, ResolutionSchoolRow } from '@/types/resolution-report'

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

function countRow(value: Record<string, unknown>, level: 'region' | 'area'): ResolutionCountRow {
  const entity = rec(level === 'region' ? value.region : value.area)
  return {
    id: idOf(entity.id),
    name: text(entity.name) || text(entity.name_uz),
    schools: num(value.active_organizations_count),
    faceId: num(value.face_control_count),
    gps: num(value.count_cars_with_gps),
    cars: num(value.cars_count),
    test: num(value.study_platform_agreement_count),
    monitoring: num(value.monitoring_count),
    contract: num(value.examination_area_agreement_count),
  }
}

function schoolRow(value: Record<string, unknown>): ResolutionSchoolRow {
  const org = rec(value.organization)
  const platform = rec(value.study_platform_agreement)
  const exam = rec(value.organization_examination_area_agreement)
  const status = exam.status
  return {
    id: idOf(org.id),
    name: text(org.name) || text(org.name_uz),
    inn: text(org.inn),
    face: text(rec(platform.face_control).name),
    gps: num(value.count_cars_with_gps),
    cars: num(value.cars_count),
    guide: text(rec(platform.study_guide).name),
    monitoring: Number(platform.monitoring) === 1,
    monitoringLegacy: Number(platform.monitoing) === 1,
    contractStatus: status == null || status === '' ? null : num(status),
    agreementFile: text(exam.agreement),
    autodromeFile: text(exam.file),
    autodromeStatusId: exam.organization_autodrome_agreement_status_id == null
      ? null
      : num(exam.organization_autodrome_agreement_status_id),
    operatingMode: org.operating_mode_id == null ? null : num(org.operating_mode_id),
  }
}

async function load(path: string) {
  const res = await apiClientV2.get<unknown>(path)
  return rowsOf(res)
}

/** GET v2 `/region-safety/organization-student-counts/report-by-region` */
export async function fetchResolutionByRegion() {
  const rows = await load('/region-safety/organization-student-counts/report-by-region')
  return rows.map((row) => countRow(row, 'region'))
}

/** GET v2 `/region-safety/organization-student-counts/report-by-area` */
export async function fetchResolutionByArea(regionId: string) {
  const query = buildListQuery({
    filters: [{ fieldKey: 'region_id', fieldOperator: '=', fieldValue: regionId }],
  })
  const rows = await load(`/region-safety/organization-student-counts/report-by-area?${query}`)
  return rows.map((row) => countRow(row, 'area'))
}

/** GET v2 `/region-safety/organization-student-counts/report-by-organization` */
export async function fetchResolutionSchools(filters: FilterItem[]) {
  const query = buildListQuery({ filters })
  const rows = await load(
    `/region-safety/organization-student-counts/report-by-organization?${query}`,
  )
  return rows.map(schoolRow)
}
