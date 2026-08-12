import { useQuery } from '@tanstack/react-query'
import { fetchStudentPenaltyShow, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { penaltyLangId } from '../utils'

export function useStudentPenaltyDetailQuery(
  id: number | string | null | undefined,
  lang: string,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  const penaltyId = id != null ? String(id) : ''
  const langId = penaltyLangId(lang)

  return useQuery({
    queryKey: queryKeys.penalties.detail(penaltyId, langId),
    queryFn: () => fetchStudentPenaltyShow(penaltyId, langId),
    enabled: isAuthenticated && enabled && Boolean(penaltyId),
  })
}
