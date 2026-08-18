import { useQuery } from '@tanstack/react-query'
import { fetchOrganizationInfo, queryKeys } from '@/api'
import { isDirectorRole } from '@/config'
import { useAuth } from '@/features/auth'

export function useOrganizationInfoQuery() {
  const { isAuthenticated, user } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorProfile.organizationInfo(),
    queryFn: fetchOrganizationInfo,
    enabled: isAuthenticated && isDirectorRole(user),
  })
}
