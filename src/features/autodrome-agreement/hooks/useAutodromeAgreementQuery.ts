import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelAutodromeAgreement,
  changeAgreementTemporaryStatus,
  deleteAutodromeAgreement,
  fetchAgreementAutodromes,
  fetchAgreementCameras,
  fetchAutodromeAgreement,
  fetchAutodromeAgreements,
  queryKeys,
  sendAutodromeAgreement,
  type AgreementCameraFilters,
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

export function useCancelAutodromeAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelAutodromeAgreement,
    onSuccess: () => invalidateAgreements(queryClient),
  })
}
