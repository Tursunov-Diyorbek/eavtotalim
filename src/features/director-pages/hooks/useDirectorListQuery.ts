import { fetchDirectorList, queryKeys } from '@/api'
import type { PageAccessKey } from '@/config/access'
import { useAuth } from '@/features/auth'
import { useQuery } from '@tanstack/react-query'

export function useDirectorListQuery(
  page: PageAccessKey,
  args: { page: number; showCount: number; search: string },
  enabled: boolean,
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.directorLists.page(page, args),
    queryFn: () => fetchDirectorList(page, args),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}
