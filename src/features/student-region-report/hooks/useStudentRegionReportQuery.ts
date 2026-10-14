import { useQuery } from '@tanstack/react-query'
import {
  fetchGroupReportByOrganization,
  fetchStudentReportByArea,
  fetchStudentReportByOrganization,
  fetchStudentReportByRegion,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useStudentReportByRegionQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.studentRegionReport.regions(),
    queryFn: fetchStudentReportByRegion,
    enabled: isAuthenticated,
  })
}

export function useStudentReportByAreaQuery(regionId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.studentRegionReport.areas(regionId ?? ''),
    queryFn: () => fetchStudentReportByArea(regionId!),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

export function useGroupReportByRegionQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groupRegionReport.regions(),
    queryFn: fetchStudentReportByRegion,
    enabled: isAuthenticated,
  })
}

export function useGroupReportByAreaQuery(regionId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groupRegionReport.areas(regionId ?? ''),
    queryFn: () => fetchStudentReportByArea(regionId!),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

export function useGroupReportByOrganizationQuery(areaId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groupRegionReport.organizations(areaId ?? ''),
    queryFn: () => fetchGroupReportByOrganization(areaId!),
    enabled: isAuthenticated && Boolean(areaId),
  })
}

export function useStudentReportByOrganizationQuery(areaId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.studentRegionReport.organizations(areaId ?? ''),
    queryFn: () => fetchStudentReportByOrganization(areaId!),
    enabled: isAuthenticated && Boolean(areaId),
  })
}
