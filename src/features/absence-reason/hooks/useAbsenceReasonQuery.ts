import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAbsenceApplicationsForStudent,
  fetchAbsenceReasonByStudent,
  fetchAbsenceReasonIndexApplications,
  queryKeys,
  rollbackAbsenceReason,
  storeStudentAbsenceReason,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAbsenceReasonIndexQuery(filters: {
  page: number
  showCount: number
  groupId: string
  regionId: string
  areaId: string
  organizationId: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.absenceReason.list(filters),
    queryFn: () => fetchAbsenceReasonIndexApplications(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useStudentShowAbsenceQuery(
  studentId: number | null | undefined,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  const id = studentId != null ? Number(studentId) : 0
  return useQuery({
    queryKey: queryKeys.absenceReason.studentShow(id),
    queryFn: () => fetchAbsenceApplicationsForStudent(id),
    enabled: isAuthenticated && enabled && id > 0,
  })
}

export function useAbsenceReasonByStudentQuery(filters: {
  page: number
  showCount: number
  groupId: string
  lastName: string
  firstName: string
  middleName: string
  regionId: string
  areaId: string
  organizationId: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.absenceReason.byStudent(filters),
    queryFn: () => fetchAbsenceReasonByStudent(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useRollbackAbsenceReasonMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rollbackAbsenceReason,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.absenceReason.all })
    },
  })
}

export function useCreateAbsenceReasonMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeStudentAbsenceReason,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.absenceReason.all })
    },
  })
}
