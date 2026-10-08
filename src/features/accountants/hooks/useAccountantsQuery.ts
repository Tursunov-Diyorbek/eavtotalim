import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccountant,
  deleteAccountant,
  fetchAccountant,
  fetchAccountantDistricts,
  fetchAccountantRegions,
  fetchAccountants,
  queryKeys,
  updateAccountant,
  type AccountantPayload,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAccountantsQuery(word = '') {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.accountants.list(word),
    queryFn: () => fetchAccountants(word),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useAccountantQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.accountants.detail(id ?? ''),
    queryFn: () => fetchAccountant(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useAccountantRegionsQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.accountants.regions(),
    queryFn: fetchAccountantRegions,
    enabled: isAuthenticated && enabled,
  })
}

export function useAccountantDistrictsQuery(regionId: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.accountants.districts(regionId),
    queryFn: () => fetchAccountantDistricts(regionId),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.accountants.all })
  }
}

export function useCreateAccountantMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: AccountantPayload) => createAccountant(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateAccountantMutation(id: string) {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (payload: AccountantPayload) => updateAccountant(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteAccountantMutation() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: deleteAccountant,
    onSuccess: invalidate,
  })
}
