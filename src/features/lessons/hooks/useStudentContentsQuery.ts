import { useQuery } from '@tanstack/react-query'
import { fetchStudentContents, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useStudentContentsQuery(topicId: number | string | null) {
  const { isAuthenticated } = useAuth()
  const id = topicId != null ? String(topicId) : ''

  return useQuery({
    queryKey: queryKeys.lessons.contents(id),
    queryFn: () => fetchStudentContents(id),
    enabled: isAuthenticated && Boolean(id),
  })
}
