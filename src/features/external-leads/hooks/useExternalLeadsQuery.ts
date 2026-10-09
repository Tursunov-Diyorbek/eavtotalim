import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchExternalLeads,
  fetchLeadStats,
  queryKeys,
  unlockExternalLead,
  updateExternalLead,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { LeadStatus } from '@/api/external-leads'

export function useExternalLeadsQuery(status: LeadStatus) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.externalLeads.list(status),
    queryFn: () => fetchExternalLeads(status),
    enabled: isAuthenticated,
  })
}

export function useLeadStatsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.externalLeads.stats(),
    queryFn: fetchLeadStats,
    enabled: isAuthenticated,
  })
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.externalLeads.all })
}

export function useUnlockLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unlockExternalLead,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
    }: {
      id: number
      status: string
      comment: string
    }) => updateExternalLead(id, { status, comment }),
    onSuccess: () => invalidate(queryClient),
  })
}
