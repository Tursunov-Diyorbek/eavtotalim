import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateOrganizationFinalExam,
  createOrganizationFinalExam,
  deactivateOrganizationFinalExam,
  fetchOrganizationFinalExams,
  queryKeys,
  updateOrganizationFinalExam,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { OrganizationFinalExamPayload } from '@/types/organization-final-exam'

export function useOrganizationFinalExamsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.organizationFinalExam.list(),
    queryFn: fetchOrganizationFinalExams,
    enabled: isAuthenticated,
  })
}

function invalidateExams(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.organizationFinalExam.all,
  })
}

export function useCreateOrganizationFinalExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrganizationFinalExam,
    onSuccess: () => invalidateExams(queryClient),
  })
}

export function useUpdateOrganizationFinalExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: number
      payload: Pick<OrganizationFinalExamPayload, 'time'>
    }) => updateOrganizationFinalExam(examId, payload),
    onSuccess: () => invalidateExams(queryClient),
  })
}

export function useToggleOrganizationFinalExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      examId,
      inactive,
    }: {
      examId: number
      inactive: boolean
    }) =>
      inactive
        ? activateOrganizationFinalExam(examId)
        : deactivateOrganizationFinalExam(examId),
    onSuccess: () => invalidateExams(queryClient),
  })
}
