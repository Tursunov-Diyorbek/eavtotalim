import { useQuery } from '@tanstack/react-query'
import {
  fetchDailyAttendanceByArea,
  fetchDailyAttendanceByOrganization,
  fetchDailyAttendanceByRegion,
  fetchDailyAttendanceByType,
  fetchDailyAttendanceTypes,
  queryKeys,
} from '@/api'
import type { FilterItem } from '@/lib/apiPage'
import { useAuth } from '@/features/auth'

export function useDailyAttendanceRegionQuery(date: string, regionId: string, active = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.dailyAttendance.regions(date, regionId),
    queryFn: () => fetchDailyAttendanceByRegion(date, regionId || undefined),
    enabled: isAuthenticated && active && Boolean(date),
  })
}

export function useDailyAttendanceAreaQuery(date: string, regionId: string, active = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.dailyAttendance.areas(date, regionId),
    queryFn: () => fetchDailyAttendanceByArea(date, regionId || undefined),
    enabled: isAuthenticated && active && Boolean(date),
  })
}

export function useDailyAttendanceOrganizationQuery(
  date: string,
  filters: FilterItem[],
  active = true,
) {
  const { isAuthenticated } = useAuth()
  const filterKey = filters.map((item) => `${item.fieldKey}=${item.fieldValue}`).join('&')
  return useQuery({
    queryKey: queryKeys.dailyAttendance.organizations(date, filterKey),
    queryFn: () => fetchDailyAttendanceByOrganization(date, filters),
    enabled: isAuthenticated && active && Boolean(date),
  })
}

export function useDailyAttendanceTypeQuery(date: string, active = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.dailyAttendance.types(date),
    queryFn: () => fetchDailyAttendanceByType(date),
    enabled: isAuthenticated && active && Boolean(date),
  })
}

export function useDailyAttendanceTypeOptionsQuery(enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.dailyAttendance.typeOptions(),
    queryFn: fetchDailyAttendanceTypes,
    enabled: isAuthenticated && enabled,
  })
}
