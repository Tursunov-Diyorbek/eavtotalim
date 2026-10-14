import { apiClientV2 } from './client'
import { buildListQuery, type FilterItem } from '@/lib/apiPage'
import type { MonthlyReportList, MonthlyReportRow } from '@/types/monthly-report'

export type MonthlyReportScope = 'region' | 'area' | 'organization'

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function text(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function metric(value: unknown) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n === 0) return null
  return n
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

function rowOf(value: Record<string, unknown>, scope: MonthlyReportScope): MonthlyReportRow {
  const region = rec(value.region)
  const area = rec(value.area)
  const org = rec(value.organization)
  const entity = scope === 'region' ? region : scope === 'area' ? area : org
  return {
    name: text(entity.name) || text(entity.name_uz),
    regionName: text(region.name) || text(region.name_uz),
    areaName: text(area.name) || text(area.name_uz),
    organizationId: idOf(org.id),
    inn: text(org.inn),
    lessonSum: metric(value.sum_today_has_lesson_students_count),
    absentSum: metric(value.sum_absent_students_count),
    absentPercent: metric(value.average_absent_percent),
    monitoringPercent: metric(value.average_monitoring_percent),
  }
}

/** GET v2 `/monthly-rs-report/index-region|index-area|index-organization` */
export async function fetchMonthlyReport(args: {
  scope: MonthlyReportScope
  year: number
  month: number
  page?: number
  pageSize?: number | 'all'
  filters?: FilterItem[]
}): Promise<MonthlyReportList> {
  const all = args.pageSize === 'all'
  const path =
    args.scope === 'region'
      ? '/monthly-rs-report/index-region'
      : args.scope === 'area'
        ? '/monthly-rs-report/index-area'
        : '/monthly-rs-report/index-organization'
  const query = buildListQuery({
    page: all ? undefined : args.page,
    show_count: all || args.pageSize == null ? undefined : args.pageSize,
    filters: args.filters,
    extra: {
      year: args.year,
      month: args.month,
      ...(all ? { show_count: 'all' } : {}),
    },
  })
  const body = await apiClientV2.get<unknown>(`${path}?${query}`)
  const { rows, total } = unpack(body)
  return { rows: rows.map((row) => rowOf(row, args.scope)), total }
}
