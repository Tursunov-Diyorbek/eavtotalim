import { useQuery } from '@tanstack/react-query'
import { fetchRoadSignsByType, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useRoadSignsByTypeQuery(
  typeId: number | string | undefined,
  page = 1,
) {
  const { isAuthenticated } = useAuth()
  const id = typeId != null ? String(typeId) : ''

  return useQuery({
    queryKey: queryKeys.roadSigns.byType(id, page),
    queryFn: () => fetchRoadSignsByType(id, page),
    enabled: isAuthenticated && Boolean(id),
  })
}
