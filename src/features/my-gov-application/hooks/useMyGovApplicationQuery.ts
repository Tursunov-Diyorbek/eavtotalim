import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyGovApplication,
  fetchMyGovApplications,
  queryKeys,
  resendMyGovAnswer,
  simulateMyGovApplication,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useMyGovApplicationsQuery(args: {
  page: number
  showCount: number
  taskId?: string
  groupName?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.myGovApplication.list(args),
    queryFn: () => fetchMyGovApplications(args),
    enabled: isAuthenticated,
  })
}

export function useMyGovApplicationQuery(id: number | null) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.myGovApplication.detail(id ?? 0),
    queryFn: () => fetchMyGovApplication(id!),
    enabled: isAuthenticated && id != null,
  })
}

export function useResendMyGovAnswerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) =>
      resendMyGovAnswer(id, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myGovApplication.all })
    },
  })
}

export function useSimulateMyGovMutation() {
  return useMutation({
    mutationFn: simulateMyGovApplication,
  })
}
