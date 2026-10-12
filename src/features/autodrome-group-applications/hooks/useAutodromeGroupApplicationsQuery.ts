import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptGroupApplication,
  fetchGroupApplications,
  queryKeys,
  rejectGroupApplication,
  type GroupApplicationFilters,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useGroupApplicationsQuery(filters: GroupApplicationFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeGroupApplications.list(filters),
    queryFn: () => fetchGroupApplications(filters),
    enabled: isAuthenticated,
  })
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.autodromeGroupApplications.all,
  })
}

export function useAcceptGroupApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acceptGroupApplication,
    onSuccess: () => invalidate(queryClient),
  })
}

export function useRejectGroupApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectGroupApplication,
    onSuccess: () => invalidate(queryClient),
  })
}
