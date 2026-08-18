import { useQuery } from '@tanstack/react-query'
import { fetchAssignedLimitOverview, queryKeys } from '@/api'
import { ROLE_CODE } from '@/config'
import { useAuth } from '@/features/auth'

export function useAssignedLimitQuery(organizationId: string | undefined) {
  const { isAuthenticated, user } = useAuth()
  const asDirector =
    user?.role === ROLE_CODE.DIRECTOR ||
    Boolean(user?.roles.includes('director'))

  return useQuery({
    queryKey: queryKeys.assignedLimit.overview(
      organizationId ?? '',
      asDirector,
    ),
    queryFn: () => fetchAssignedLimitOverview(organizationId!, asDirector),
    enabled: isAuthenticated && Boolean(organizationId),
  })
}
