import { useQuery } from '@tanstack/react-query'
import { fetchStudentTopics, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useStudentTopicsQuery(
  eduTypeLessonId: number | string | undefined,
  page = 1,
  showCount = 10,
) {
  const { isAuthenticated } = useAuth()
  const id = eduTypeLessonId != null ? String(eduTypeLessonId) : ''

  return useQuery({
    queryKey: queryKeys.lessons.topics(id, page, showCount),
    queryFn: () =>
      fetchStudentTopics({
        eduTypeLessonId: id,
        page,
        showCount,
      }),
    enabled: isAuthenticated && Boolean(id),
  })
}
