import { useQuery } from '@tanstack/react-query'
import { fetchGroupCounts, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useGroupCountsQuery() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.groups.counts(),
    queryFn: fetchGroupCounts,
    enabled: isAuthenticated,
  })
}
