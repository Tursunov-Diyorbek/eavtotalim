import { useQuery } from '@tanstack/react-query'
import { fetchStudentLessons, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

/** O‘quvchi darslari — GET /student-content/lessons */
export function useStudentLessonsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.lessons.list(),
    queryFn: fetchStudentLessons,
    enabled: isAuthenticated && enabled,
  })
}
