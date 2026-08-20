import { apiClient, apiClientV2, withAccessToken } from './client'
import { assertOk, buildListQuery, unwrapPage } from '@/lib/apiPage'
import type {
  MonitoringAbsenceRow,
  MonitoringStudentRow,
} from '@/types/monitoring-report'

export async function fetchMonitoringStudents(args: {
  page: number
  showCount: number
  name?: string
  groupName?: string
}) {
  const extra: Record<string, string> = {}
  if (args.name?.trim()) extra.name = args.name.trim()
  if (args.groupName?.trim()) extra.group_name = args.groupName.trim()
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/monitoring/students/report?${query}`,
  )
  assertOk(res)
  return unwrapPage<MonitoringStudentRow>(res, args.page, args.showCount)
}

export async function fetchMonitoringStudentAbsences(args: {
  studentId: string
  page: number
  showCount: number
}) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: { student_id: args.studentId },
  })
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/report-monitoring-by-student-show?${query}`),
  )
  assertOk(res)
  return unwrapPage<MonitoringAbsenceRow>(res, args.page, args.showCount)
}
