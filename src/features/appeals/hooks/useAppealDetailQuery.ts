import { useQuery } from '@tanstack/react-query'
import { fetchAppealById, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAppealDetailQuery(id: number | string | undefined) {
  const { isAuthenticated } = useAuth()
  const appealId = id != null ? String(id) : ''

  return useQuery({
    queryKey: queryKeys.appeals.detail(appealId),
    queryFn: () => fetchAppealById(appealId),
    enabled: isAuthenticated && Boolean(appealId),
  })
}
