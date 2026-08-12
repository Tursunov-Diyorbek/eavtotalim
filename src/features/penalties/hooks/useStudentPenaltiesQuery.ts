import { useQuery } from '@tanstack/react-query'
import { fetchStudentPenalties, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import { penaltyLangId } from '../utils'

export function useStudentPenaltiesQuery(
  categoryId: number | string | undefined,
  lang: string,
) {
  const { isAuthenticated } = useAuth()
  const id = categoryId != null ? String(categoryId) : ''
  const langId = penaltyLangId(lang)

  return useQuery({
    queryKey: queryKeys.penalties.byCategory(id, langId),
    queryFn: () => fetchStudentPenalties(id, langId),
    enabled: isAuthenticated && Boolean(id),
  })
}
