import { asNamedList, assertOk, buildListQuery, unwrapPage } from '@/lib/apiPage'
import { apiClient, apiClientV2, withAccessToken } from './client'
import type { LessonSkipDetail, LessonSkipRow } from '@/types/lesson-skips'

export async function fetchLessonSkips(args: {
  page: number
  showCount: number
  word?: string
}) {
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: { word: args.word?.trim() },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/teacher/lesson-skips?${query}`,
  )
  assertOk(res)
  return unwrapPage<LessonSkipRow>(res, args.page, args.showCount)
}

export async function fetchLessonSkipShow(studentId: string) {
  const query = new URLSearchParams({ student_id: studentId })
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/teacher/lesson-skips-show?${query}`),
  )
  assertOk(res)
  return asNamedList<LessonSkipDetail>(res.data)
}
