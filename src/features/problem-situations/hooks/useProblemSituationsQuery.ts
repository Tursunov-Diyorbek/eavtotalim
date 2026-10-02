import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProblemSituation,
  deleteProblemSituation,
  fetchProblemSituation,
  fetchProblemSituations,
  fetchProblemSituationStatuses,
  queryKeys,
  updateProblemSituation,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useProblemSituationsQuery(args: {
  page: number
  showCount: number
  statusId?: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.problemSituations.list(args),
    queryFn: () => fetchProblemSituations(args),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useProblemSituationStatusesQuery(enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.problemSituations.statuses(),
    queryFn: fetchProblemSituationStatuses,
    enabled: isAuthenticated && enabled,
  })
}

export function useProblemSituationQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.problemSituations.detail(id ?? ''),
    queryFn: () => fetchProblemSituation(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCreateProblemSituationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProblemSituation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.problemSituations.all,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useUpdateProblemSituationMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateProblemSituation(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.problemSituations.all,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useDeleteProblemSituationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProblemSituation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.problemSituations.all,
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}
