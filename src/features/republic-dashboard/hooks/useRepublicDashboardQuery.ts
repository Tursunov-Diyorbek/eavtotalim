import { useQuery } from '@tanstack/react-query'
import { fetchRegionDailyReport, fetchSuperiorOrganizations } from '@/api/republic-dashboard'
import { queryKeys } from '@/api/query-keys'

export function useRegionDailyReportQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.republicDashboard.regions(date),
    queryFn: () => fetchRegionDailyReport(date),
  })
}

export function useSuperiorOrganizationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.republicDashboard.superior(),
    queryFn: fetchSuperiorOrganizations,
    enabled,
  })
}
