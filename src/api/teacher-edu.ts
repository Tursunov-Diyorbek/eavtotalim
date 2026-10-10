import { apiClient, withAccessToken } from './client'
import { asNamedList, assertOk } from '@/lib/apiPage'
import type { TextbookContentBlock } from '@/types/textbooks'

export type TeacherEduType = {
  id: number
  image?: string | null
  name_for_exam?: string | null
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
}

export type TeacherEduLesson = {
  id: number
  lesson?: {
    name_uz?: string | null
    name_kiril?: string | null
    name_qq?: string | null
    name_ru?: string | null
    name_en?: string | null
  } | null
}

export type TeacherEduTopic = {
  id: number
  name_uz?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_ru?: string | null
  name_en?: string | null
}

function listOf<T extends { id?: number | string }>(body: unknown): T[] {
  if (!body || typeof body !== 'object') return []
  return asNamedList<T>((body as Record<string, unknown>).data)
}

/** GET v1 /teacher/edu-types */
export async function fetchTeacherEduTypes() {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/teacher/edu-types'),
  )
  assertOk(res)
  return listOf<TeacherEduType>(res)
}

/** GET v1 /teacher/lessons?edu_type_id= */
export async function fetchTeacherEduLessons(eduTypeId: string) {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(
      `/teacher/lessons?edu_type_id=${encodeURIComponent(eduTypeId)}`,
    ),
  )
  assertOk(res)
  return listOf<TeacherEduLesson>(res)
}

/** GET v1 /teacher/topics?edu_type_lesson_id= */
export async function fetchTeacherEduTopics(lessonId: string) {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(
      `/teacher/topics?edu_type_lesson_id=${encodeURIComponent(lessonId)}`,
    ),
  )
  assertOk(res)
  return listOf<TeacherEduTopic>(res)
}

/** GET v1 /teacher/contents?topic_id= */
export async function fetchTeacherEduContents(topicId: string) {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/teacher/contents?topic_id=${encodeURIComponent(topicId)}`),
  )
  assertOk(res)
  return listOf<TextbookContentBlock & { id?: number }>(res)
}
