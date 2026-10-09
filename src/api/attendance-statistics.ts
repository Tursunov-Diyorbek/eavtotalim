import { apiClientV2 } from './client'
import { buildListQuery, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type {
  AbsenceGroupRow,
  AbsenceStudentRow,
  DailyAttendanceGroup,
} from '@/types/attendance-statistics'

export type AttendancePageArgs = {
  date: string
  page: number
  pageSize: number
  groupId?: string
}

function withTotalPages<T>(payload: unknown, page: ApiPage<T>): ApiPage<T> {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : body
  const totalPages = Number(nested.total_pages ?? body.total_pages)
  if (Number.isFinite(totalPages) && totalPages > 0) {
    return { ...page, last_page: totalPages }
  }
  return page
}

/** GET v2 /group-attendance-report — edu_status = 1 */
export async function fetchDailyAttendance(args: AttendancePageArgs) {
  const qs = buildListQuery({
    page: args.page,
    show_count: args.pageSize,
    extra: { attendance_date: args.date },
    filters: [{ fieldKey: 'edu_status', fieldOperator: '=', fieldValue: '1' }],
  })
  const res = await apiClientV2.get<unknown>(`/group-attendance-report?${qs}`)
  return withTotalPages(res, unwrapPage<DailyAttendanceGroup>(res, args.page, args.pageSize))
}

/** POST v2 /group-attendance-report/update-for-one-day */
export async function refreshDailyAttendance(date: string) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    '/group-attendance-report/update-for-one-day',
    { date },
  )
  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Request failed')
  }
  return res
}

/** GET v2 /group-absence-report/by-group */
export async function fetchGroupAbsence(args: AttendancePageArgs) {
  const qs = buildListQuery({
    page: args.page,
    show_count: args.pageSize,
    extra: { attendance_date: args.date },
  })
  const res = await apiClientV2.get<unknown>(`/group-absence-report/by-group?${qs}`)
  return withTotalPages(res, unwrapPage<AbsenceGroupRow>(res, args.page, args.pageSize))
}

/** GET v2 /group-absence-report/by-student */
export async function fetchStudentAbsence(args: AttendancePageArgs) {
  const qs = buildListQuery({
    page: args.page,
    show_count: args.pageSize,
    extra: { attendance_date: args.date },
    filters: args.groupId
      ? [{ fieldKey: 'group_id', fieldOperator: '=', fieldValue: args.groupId }]
      : undefined,
  })
  const res = await apiClientV2.get<unknown>(`/group-absence-report/by-student?${qs}`)
  return withTotalPages(res, unwrapPage<AbsenceStudentRow>(res, args.page, args.pageSize))
}
