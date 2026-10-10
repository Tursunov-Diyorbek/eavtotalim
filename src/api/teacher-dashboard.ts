import { apiClient } from './client'
import { asNamedList, assertOk } from '@/lib/apiPage'
import type { TeacherGroupCard, TeacherScheduleDay } from '@/types/teacher-dashboard'

function listOf<T>(body: unknown): T[] {
  if (!body || typeof body !== 'object') return []
  const rec = body as Record<string, unknown>
  return asNamedList<T & { id?: number | string }>(rec.data) as T[]
}

/** GET v1 `/teacher/groups` — bosh sahifa uchun 4 ta guruh. */
export async function fetchTeacherGroups(): Promise<TeacherGroupCard[]> {
  const res = await apiClient.get<Record<string, unknown>>(
    '/teacher/groups?show_count=4&status=all',
  )
  assertOk(res)
  return listOf<TeacherGroupCard>(res).slice(0, 4)
}

/** GET v1 `/teacher/dashboard` — dars kunlari. */
export async function fetchTeacherSchedule(): Promise<TeacherScheduleDay[]> {
  const res = await apiClient.get<Record<string, unknown>>('/teacher/dashboard')
  assertOk(res)
  return listOf<TeacherScheduleDay>(res)
}
