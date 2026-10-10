import { useQuery } from '@tanstack/react-query'
import { fetchLessonSkipShow, fetchLessonSkips, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useLessonSkipsQuery(args: {
  page: number
  showCount: number
  word?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.lessonSkips.list(args),
    queryFn: () => fetchLessonSkips(args),
    enabled: isAuthenticated,
  })
}

export function useLessonSkipShowQuery(studentId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = studentId ?? ''
  return useQuery({
    queryKey: queryKeys.lessonSkips.show(id),
    queryFn: () => fetchLessonSkipShow(id),
    enabled: isAuthenticated && Boolean(id),
  })
}
