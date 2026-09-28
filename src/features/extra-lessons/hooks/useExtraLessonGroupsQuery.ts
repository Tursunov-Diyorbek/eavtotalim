import { useQuery } from '@tanstack/react-query'
import { fetchExtraLessonGroups, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useExtraLessonGroupsQuery(filters: {
  page: number
  showCount: number
  groupSearch: string
  eduStatus: string
  fromDate: string
  toDate: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.extraLessons.groups(filters),
    queryFn: () => fetchExtraLessonGroups(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}
