import { useQuery } from '@tanstack/react-query'
import { fetchRoadSignById, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useRoadSignDetailQuery(
  id: number | string | null | undefined,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  const signId = id != null ? String(id) : ''

  return useQuery({
    queryKey: [...queryKeys.roadSigns.all, 'detail', signId] as const,
    queryFn: () => fetchRoadSignById(signId),
    enabled: isAuthenticated && enabled && Boolean(signId),
  })
}
