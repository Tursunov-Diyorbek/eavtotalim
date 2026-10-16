import { apiClientV2 } from './client'

/** POST v2 `/student-alternative-study-reports` — o‘quvchi maktab ma’lumoti noto‘g‘ri degan murojaat. */
export async function submitStudentAlternativeStudyReport(note: string) {
  return apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/student-alternative-study-reports', { note })
}
