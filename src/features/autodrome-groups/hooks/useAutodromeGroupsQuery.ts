import { useQuery } from '@tanstack/react-query'
import {
  fetchAutodromeOrgGroupCounts,
  fetchAutodromeOrgGroups,
  fetchAutodromeOrgSchools,
  fetchGeneralEduTypes,
  queryKeys,
  type AutodromeOrgGroupFilters,
  type AutodromeOrgSchoolFilters,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeOrgGroupsQuery(filters: AutodromeOrgGroupFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeGroups.list(filters),
    queryFn: () => fetchAutodromeOrgGroups(filters),
    enabled: enabled && isAuthenticated,
  })
}

export function useAutodromeOrgGroupCountsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeGroups.counts(),
    queryFn: fetchAutodromeOrgGroupCounts,
    enabled: enabled && isAuthenticated,
  })
}

export function useAutodromeOrgSchoolsQuery(filters: AutodromeOrgSchoolFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeGroups.schools(filters),
    queryFn: () => fetchAutodromeOrgSchools(filters),
    enabled: enabled && isAuthenticated,
  })
}

export function useGeneralEduTypesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeGroups.eduTypes(),
    queryFn: fetchGeneralEduTypes,
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
