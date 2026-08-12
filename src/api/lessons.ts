import { apiClientV2 } from './client'
import type { ApiEnvelope } from './auth'
import type {
  StudentContentItem,
  StudentLessonItem,
  StudentTopicsPage,
} from '@/types'

function toQuery(
  params: Record<string, string | number | Array<string | number> | undefined>,
): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) {
        sp.append(`${key}[]`, String(item))
      }
    } else {
      sp.set(key, String(value))
    }
  }
  const q = sp.toString()
  return q ? `?${q}` : ''
}

/** O‘quvchi darslari (fanlar). */
export async function fetchStudentLessons(): Promise<StudentLessonItem[]> {
  const res = await apiClientV2.get<ApiEnvelope<StudentLessonItem[]>>(
    '/student-content/lessons',
  )
  return Array.isArray(res.data) ? res.data : []
}

export type FetchStudentTopicsParams = {
  eduTypeLessonId: number | string
  page?: number
  showCount?: number
}

/** Mavzular — GET /student-content/topics */
export async function fetchStudentTopics({
  eduTypeLessonId,
  page = 1,
  showCount = 10,
}: FetchStudentTopicsParams): Promise<StudentTopicsPage> {
  const res = await apiClientV2.get<ApiEnvelope<StudentTopicsPage>>(
    `/student-content/topics${toQuery({
      edu_type_lesson_id: eduTypeLessonId,
      page,
      show_count: showCount,
      relations: ['examTopicTestStudentResult', 'examTopics'],
    })}`,
  )

  const pageData = res.data
  if (!pageData || typeof pageData !== 'object') {
    return { data: [], total_items: 0 }
  }

  return {
    data: Array.isArray(pageData.data) ? pageData.data : [],
    total_items:
      pageData.total_items ??
      (pageData as { total?: number }).total ??
      0,
    current_page: pageData.current_page,
    last_page: pageData.last_page,
    per_page: pageData.per_page,
  }
}

/** Mavzu kontenti — GET /student-content/contents?topic_id= */
export async function fetchStudentContents(
  topicId: number | string,
): Promise<StudentContentItem[]> {
  const res = await apiClientV2.get<ApiEnvelope<StudentContentItem[]>>(
    `/student-content/contents${toQuery({ topic_id: topicId })}`,
  )
  return Array.isArray(res.data) ? res.data : []
}
