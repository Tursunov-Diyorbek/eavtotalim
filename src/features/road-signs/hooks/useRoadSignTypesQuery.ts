import { useQuery } from '@tanstack/react-query'
import { fetchRoadSignTypes, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useRoadSignTypesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.roadSigns.types(),
    queryFn: fetchRoadSignTypes,
    enabled: isAuthenticated && enabled,
  })
}
