import { useQuery } from '@tanstack/react-query'
import { fetchGroups, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import type { GroupsFilters } from '@/types/groups'

export function useGroupsQuery(filters: GroupsFilters, enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.groups.list(filters),
    queryFn: () => fetchGroups(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}
