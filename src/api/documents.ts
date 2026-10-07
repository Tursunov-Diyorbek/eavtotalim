import { apiClient, apiClientV2, withAccessToken } from './client'
import { asNamedList, assertOk, unwrapEntity, unwrapPage } from '@/lib/apiPage'
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

export type JournalLessonRow = {
  theoretical_hours_sum?: number | string | null
  lesson?: { name_uz?: string | null } | null
}

/** GET v2 `/groups/show/:id/lessons` — jurnal o‘quv rejasi. */
export async function fetchGroupJournalLessons(groupId: string): Promise<JournalLessonRow[]> {
  const res = await apiClientV2.get<{ data?: unknown } | JournalLessonRow[]>(
    `/groups/show/${groupId}/lessons`,
  )
  const raw = Array.isArray(res) ? res : res.data
  return Array.isArray(raw) ? (raw as JournalLessonRow[]) : []
}

export type PracticalChapter = {
  id: number
  name_uz?: string | null
}

/** GET v1 `/chapters-by-edutype-lesson` — amaliy mashq vazifalari. */
export async function fetchPracticalChapters(eduTypeLessonId: string): Promise<PracticalChapter[]> {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(
      `/chapters-by-edutype-lesson?edu_type_lesson_id=${encodeURIComponent(eduTypeLessonId)}`,
    ),
  )
  assertOk(res)
  return unwrapPage<PracticalChapter>(res).data
}
