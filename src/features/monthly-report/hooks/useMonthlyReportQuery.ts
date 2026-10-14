import { useQuery } from '@tanstack/react-query'
import { fetchMonthlyReport, queryKeys } from '@/api'
import type { FilterItem } from '@/lib/apiPage'
import { useAuth } from '@/features/auth'

export function useMonthlyRegionQuery(year: number, month: number, active = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.monthlyReport.regions(year, month),
    queryFn: () => fetchMonthlyReport({ scope: 'region', year, month, pageSize: 'all' }),
    enabled: isAuthenticated && active && year > 0 && month > 0,
  })
}

export function useMonthlyAreaQuery(
  year: number,
  month: number,
  page: number,
  pageSize: number,
  filters: FilterItem[],
  active = true,
) {
  const { isAuthenticated } = useAuth()
  const filterKey = filters.map((item) => `${item.fieldKey}=${item.fieldValue}`).join('&')
  return useQuery({
    queryKey: queryKeys.monthlyReport.areas(year, month, page, pageSize, filterKey),
    queryFn: () => fetchMonthlyReport({ scope: 'area', year, month, page, pageSize, filters }),
    enabled: isAuthenticated && active && year > 0 && month > 0,
  })
}

export function useMonthlyOrganizationQuery(
  year: number,
  month: number,
  page: number,
  pageSize: number,
  filters: FilterItem[],
  active = true,
) {
  const { isAuthenticated } = useAuth()
  const filterKey = filters.map((item) => `${item.fieldKey}=${item.fieldValue}`).join('&')
  return useQuery({
    queryKey: queryKeys.monthlyReport.organizations(year, month, page, pageSize, filterKey),
    queryFn: () =>
      fetchMonthlyReport({ scope: 'organization', year, month, page, pageSize, filters }),
    enabled: isAuthenticated && active && year > 0 && month > 0,
  })
}
