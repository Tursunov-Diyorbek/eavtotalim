import { useQuery } from '@tanstack/react-query'
import { fetchAutodromeGuides, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeGuidesQuery(lang: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.circuitDiagram.guides(lang),
    queryFn: () => fetchAutodromeGuides(lang),
    enabled: isAuthenticated,
  })
}
