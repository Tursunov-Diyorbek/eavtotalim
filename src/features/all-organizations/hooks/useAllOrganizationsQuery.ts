import { useQuery } from '@tanstack/react-query'
import { fetchAllOrganization, fetchAllOrganizations, type AllOrganizationsArgs } from '@/api/all-organizations'
import { queryKeys } from '@/api/query-keys'

export function useAllOrganizationsQuery(args: AllOrganizationsArgs) {
  return useQuery({
    queryKey: queryKeys.allOrganizations.list(args),
    queryFn: () => fetchAllOrganizations(args),
  })
}

export function useAllOrganizationQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.allOrganizations.detail(id),
    queryFn: () => fetchAllOrganization(id),
    enabled: Boolean(id),
  })
}
