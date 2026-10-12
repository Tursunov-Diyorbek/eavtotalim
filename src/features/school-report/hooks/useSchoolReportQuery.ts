import { useQuery } from '@tanstack/react-query'
import { fetchSchoolReport, fetchSchoolReportGroups, fetchSchoolReportMonitoring, fetchSchoolReportTotals, type SchoolReportArgs } from '@/api/school-report'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth'

export function useSchoolReportQuery(args: SchoolReportArgs) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.schoolReport.list(args),
    queryFn: () => fetchSchoolReport(args),
    enabled: isAuthenticated,
  })
}

export function useSchoolReportTotalsQuery(args: {
  date: string
  regionId?: string
  areaId?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.schoolReport.totals(args),
    queryFn: () => fetchSchoolReportTotals(args),
    enabled: isAuthenticated,
  })
}

export function useSchoolReportGroupsQuery(args: {
  organizationId: string
  page: number
  showCount: number
  word: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.schoolReport.groups(args),
    queryFn: () => fetchSchoolReportGroups(args),
    enabled: isAuthenticated && Boolean(args.organizationId),
  })
}

export function useSchoolReportMonitoringQuery(groupId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.schoolReport.monitoring(groupId ?? ''),
    queryFn: () => fetchSchoolReportMonitoring(groupId!),
    enabled: isAuthenticated && Boolean(groupId),
  })
}
