import { useQuery } from '@tanstack/react-query'
import { fetchTextbookEduTypes, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useTextbookEduTypesQuery(lessonId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = lessonId ?? ''

  return useQuery({
    queryKey: queryKeys.textbooks.eduTypes(id),
    queryFn: () => fetchTextbookEduTypes(id),
    enabled: isAuthenticated && Boolean(id),
  })
}
