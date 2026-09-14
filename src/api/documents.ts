import { apiClient, apiClientV2, withAccessToken } from './client'
import { asNamedList, assertOk, unwrapEntity } from '@/lib/apiPage'
import type {
  PrintGroupData,
  PrintRegTeacher,
  PrintTeacherRow,
  PrintTeachersPayload,
} from '@/types/documents'

/** POST v1 `/print/students-by-group` */
export async function fetchPrintStudentsByGroup(
  groupId: string,
): Promise<PrintGroupData> {
  const form = new FormData()
  form.append('group_id', groupId)
  const res = await apiClient.postForm<PrintGroupData & { data?: PrintGroupData }>(
    withAccessToken('/print/students-by-group'),
    form,
  )
  assertOk(res)
  const nested =
    res.data && typeof res.data === 'object' && !Array.isArray(res.data)
      ? res.data
      : undefined
  const merged: PrintGroupData = { ...res, ...nested }
  if (!Array.isArray(merged.students) && Array.isArray(res.students)) {
    merged.students = res.students
  }
  merged.region =
    merged.region ?? res.region ?? nested?.region ?? merged.organization?.region ?? null
  return merged
}

/** GET v2 `/groups/print-document/:id` */
export async function fetchPrintTeachers(
  groupId: string,
): Promise<PrintTeachersPayload> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    message?: string
    data?: unknown
  }>(`/groups/print-document/${encodeURIComponent(groupId)}`)
  assertOk(res)
  const raw = unwrapEntity<Record<string, unknown>>(res)
  const teachers = Array.isArray(raw.teachers)
    ? (raw.teachers as PrintRegTeacher[])
    : []
  const practical_teachers = Array.isArray(raw.practical_teachers)
    ? (raw.practical_teachers as PrintRegTeacher[])
    : []
  const rows = asNamedList<PrintTeacherRow>(
    Array.isArray(res.data) ? res.data : raw,
  )
  return { teachers, practical_teachers, rows }
}
