import { useQuery } from '@tanstack/react-query'
import { fetchAutodromeGuideById, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeGuideDetailQuery(
  id: number | string | null | undefined,
) {
  const { isAuthenticated } = useAuth()
  const guideId = id != null ? String(id) : ''

  return useQuery({
    queryKey: queryKeys.circuitDiagram.detail(guideId),
    queryFn: () => fetchAutodromeGuideById(guideId),
    enabled: isAuthenticated && Boolean(guideId),
  })
}
