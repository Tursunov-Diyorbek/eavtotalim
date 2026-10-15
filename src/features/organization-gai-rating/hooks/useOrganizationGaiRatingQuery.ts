import { useQuery } from '@tanstack/react-query'
import {
  fetchOrganizationGaiRatingList,
  fetchOrganizationGaiRankings,
  queryKeys,
  type OrganizationGaiRatingFilters,
  type OrganizationGaiRatingListFilters,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useOrganizationGaiRankingsQuery(
  filters: OrganizationGaiRatingFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.organizationGaiRating.rankings(filters),
    queryFn: () => fetchOrganizationGaiRankings(filters),
    enabled: isAuthenticated && filters.year > 0 && filters.period > 0,
    placeholderData: (prev) => prev,
  })
}

export function useOrganizationGaiRatingListQuery(
  filters: OrganizationGaiRatingListFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.organizationGaiRating.records(filters),
    queryFn: () => fetchOrganizationGaiRatingList(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}
