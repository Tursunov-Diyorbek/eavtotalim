import { useQuery } from '@tanstack/react-query'
import { fetchGroupDetails, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useGroupDetailsQuery(
  professionId: number | null | undefined,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  const id = professionId != null ? Number(professionId) : null

  return useQuery({
    queryKey: queryKeys.groupDetails.detail(id ?? 0),
    queryFn: () => fetchGroupDetails(id!),
    enabled: isAuthenticated && enabled && id != null && id > 0,
  })
}
