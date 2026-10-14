import { useQuery } from '@tanstack/react-query'
import {
  fetchResolutionByArea,
  fetchResolutionByRegion,
  fetchResolutionSchools,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useResolutionRegionQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.resolutionReport.regions(),
    queryFn: fetchResolutionByRegion,
    enabled: isAuthenticated,
  })
}

export function useResolutionAreaQuery(regionId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.resolutionReport.areas(regionId ?? ''),
    queryFn: () => fetchResolutionByArea(regionId!),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

export function useResolutionSchoolsQuery(
  scope: 'area' | 'region',
  id: string | undefined,
  operatingMode: string,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.resolutionReport.schools(scope, id ?? '', operatingMode),
    queryFn: () =>
      fetchResolutionSchools([
        {
          fieldKey: scope === 'area' ? 'area_id' : 'region_id',
          fieldOperator: '=',
          fieldValue: id!,
        },
        ...(operatingMode
          ? [{ fieldKey: 'operating_mode_id', fieldOperator: '=', fieldValue: operatingMode }]
          : []),
      ]),
    enabled: isAuthenticated && Boolean(id),
  })
}
