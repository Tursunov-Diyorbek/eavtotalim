import { useQuery } from '@tanstack/react-query'
import {
  fetchMonthlyRiskScores,
  fetchOrgRiskScores,
  fetchRiskIndicators,
  fetchRiskInspectors,
  fetchRiskInspections,
  queryKeys,
  type MonthlyRiskScoreFilters,
  type OrgRiskScoreFilters,
  type RiskInspectionFilters,
  type RiskInspectorFilters,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useMonthlyRiskScoresQuery(
  filters: MonthlyRiskScoreFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.riskIndicator.scores(filters),
    queryFn: () => fetchMonthlyRiskScores(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useOrgRiskScoresQuery(
  filters: OrgRiskScoreFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.riskIndicator.byOrganization(filters),
    queryFn: () => fetchOrgRiskScores(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useRiskInspectorsQuery(
  filters: RiskInspectorFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.riskIndicator.inspectors(filters),
    queryFn: () => fetchRiskInspectors(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useRiskInspectionsQuery(
  filters: RiskInspectionFilters & { page: number; showCount: number },
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.riskIndicator.inspections(filters),
    queryFn: () => fetchRiskInspections(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useRiskIndicatorsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.riskIndicator.options(),
    queryFn: fetchRiskIndicators,
    enabled: isAuthenticated && enabled,
  })
}
