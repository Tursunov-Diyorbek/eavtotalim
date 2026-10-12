import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAreaReport, fetchOrgReport, fetchRegionReport, queryKeys, refreshAreaReport } from '@/api'
import { useAuth } from '@/features/auth'

export function useRegionReportQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.regionReport.regions(),
    queryFn: fetchRegionReport,
    enabled: isAuthenticated,
  })
}

export function useAreaReportQuery(regionId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.regionReport.area(regionId ?? ''),
    queryFn: () => fetchAreaReport(regionId!),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

export function useRefreshAreaReportMutation(regionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => refreshAreaReport(regionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.regionReport.area(regionId) })
    },
  })
}

export function useOrgReportQuery(areaId: string | undefined, regionId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.regionReport.org(areaId ?? '', regionId ?? ''),
    queryFn: () => fetchOrgReport(areaId!, regionId!),
    enabled: isAuthenticated && Boolean(areaId) && Boolean(regionId),
  })
}
