import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptAutodromeAgreement,
  cancelAgreementFromAutodrome,
  cancelAutodromeAgreement,
  changeAgreementTemporaryStatus,
  changeAgreementVipStatus,
  changeTemporaryStatusFromAutodrome,
  deleteAutodromeAgreement,
  fetchAgreementAutodromes,
  fetchAgreementCameras,
  fetchAutodromeAgreement,
  fetchAutodromeAgreements,
  fetchAutodromeContracts,
  queryKeys,
  rejectAutodromeAgreement,
  sendAutodromeAgreement,
  type AgreementCameraFilters,
  type AutodromeContractFilters,
} from '@/api'
import { useAuth } from '@/features/auth'

function invalidateAgreements(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.autodromeAgreement.all,
  })
  void queryClient.invalidateQueries({
    queryKey: queryKeys.directorDashboard.cameras(),
  })
}

export function useAutodromeAgreementsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAgreement.list(),
    queryFn: fetchAutodromeAgreements,
    enabled: isAuthenticated,
  })
}

export function useAutodromeAgreementQuery(id?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAgreement.detail(id ?? ''),
    queryFn: () => fetchAutodromeAgreement(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useAgreementAutodromesQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAgreement.autodromes(),
    queryFn: fetchAgreementAutodromes,
    enabled: isAuthenticated,
  })
}

export function useAgreementCamerasQuery(
  autodromeId: number | undefined,
  filters: AgreementCameraFilters,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAgreement.cameras(autodromeId ?? 0, filters),
    queryFn: () => fetchAgreementCameras(autodromeId!, filters),
    enabled: enabled && isAuthenticated && Boolean(autodromeId),
  })
}

export function useSendAutodromeAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendAutodromeAgreement,
    onSuccess: () => invalidateAgreements(queryClient),
  })
}

export function useDeleteAutodromeAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAutodromeAgreement,
    onSuccess: () => invalidateAgreements(queryClient),
  })
}

export function useChangeAgreementTemporaryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changeAgreementTemporaryStatus,
    onSuccess: () => invalidateAgreements(queryClient),
  })
}

function invalidateContracts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.autodromeContracts.all })
  void queryClient.invalidateQueries({ queryKey: queryKeys.autodromeAgreement.all })
}

export function useAutodromeContractsQuery(filters: AutodromeContractFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeContracts.list(filters),
    queryFn: () => fetchAutodromeContracts(filters),
    enabled: isAuthenticated && Boolean(filters.autodromeId),
  })
}

export function useChangeAgreementVipMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changeAgreementVipStatus,
    onSuccess: () => invalidateContracts(queryClient),
  })
}

export function useAutodromeTemporaryStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changeTemporaryStatusFromAutodrome,
    onSuccess: () => invalidateContracts(queryClient),
  })
}

export function useCancelAgreementFromAutodromeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelAgreementFromAutodrome,
    onSuccess: () => invalidateContracts(queryClient),
  })
}

export function useAcceptAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acceptAutodromeAgreement,
    onSuccess: () => invalidateContracts(queryClient),
  })
}

export function useRejectAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rejectAutodromeAgreement(id, reason),
    onSuccess: () => invalidateContracts(queryClient),
  })
}

export function useCancelAutodromeAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelAutodromeAgreement,
    onSuccess: () => invalidateAgreements(queryClient),
  })
}
