import { useQuery } from '@tanstack/react-query'
import { fetchActiveSchools, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import type { ActiveSchoolsSearchParams } from '@/types'

export function useActiveSchoolsQuery(
  params: ActiveSchoolsSearchParams,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.activeSchools.list(params),
    queryFn: () => fetchActiveSchools(params),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}
