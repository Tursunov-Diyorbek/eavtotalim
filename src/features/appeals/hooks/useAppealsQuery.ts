import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchAppeals, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'
import type { AppealsFilters } from '@/types'

export function useAppealsQuery(filters: AppealsFilters) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.appeals.list({
      page: filters.page ?? 1,
      showCount: filters.showCount ?? 10,
      lastName: filters.lastName ?? '',
      firstName: filters.firstName ?? '',
      middleName: filters.middleName ?? '',
      appealTypeId: filters.appealTypeId ?? null,
      isClosed: filters.isClosed ?? null,
      status: filters.status ?? null,
    }),
    queryFn: () => fetchAppeals(filters),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}
