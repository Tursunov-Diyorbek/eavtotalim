import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addStudentsToGroup,
  removeStudentsFromGroup,
  addTeacherToGroup,
  attachCarsToGroup,
  clearStudentFinalExamHistory,
  createGroup,
  createGroupTimetable,
  deleteGroup,
  ensureStudentRoleForGroup,
  fixGroupAttendance,
  generateStudentCertificate,
  moveGroupTimetable,
  prepareGroupCertificate,
  queryKeys,
  removeCarFromGroup,
  replaceGroupCar,
  retakeFinalExam,
  sendGroupToGai,
  storeGroupFinalMarks,
  storeStudentAbsenceReason,
  unmergeTeacherFromGroup,
  updateGroup,
  updateGroupAverageAttendance,
  editGroupMonitoring,
  refreshGroupDayAttendance,
} from '@/api'
import type { CreateGroupPayload, UpdateGroupPayload } from '@/types/groups'

export function useCreateGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useUpdateGroupMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateGroupPayload) => updateGroup(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useRefreshGroupAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateGroupAverageAttendance,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useSendGroupToGaiMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendGroupToGai,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useFixGroupAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fixGroupAttendance,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function usePrepareGroupCertificateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: prepareGroupCertificate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

function invalidateGroup(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
}

export function useAddStudentsToGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, studentIds }: { groupId: string; studentIds: number[] }) =>
      addStudentsToGroup(groupId, studentIds),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useRemoveStudentsFromGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      studentIds,
      file,
    }: {
      groupId: string
      studentIds: number[]
      file?: File | null
    }) => removeStudentsFromGroup(groupId, studentIds, file),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useAttachCarsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, carIds }: { groupId: string; carIds: number[] }) =>
      attachCarsToGroup(groupId, carIds),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useReplaceGroupCarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: replaceGroupCar,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useRemoveCarFromGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, carId }: { groupId: string; carId: number }) =>
      removeCarFromGroup(groupId, carId),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useAddTeacherToGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      teacherId,
      typeId,
    }: {
      groupId: string
      teacherId: number
      typeId: number
    }) => addTeacherToGroup(groupId, teacherId, typeId),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useUnmergeTeacherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, teacherId }: { groupId: string; teacherId: number }) =>
      unmergeTeacherFromGroup(groupId, teacherId),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useCreateTimetableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGroupTimetable,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useMoveTimetableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      fromDate,
      toDate,
    }: {
      groupId: string
      fromDate: string
      toDate: string
    }) => moveGroupTimetable(groupId, fromDate, toDate),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useGenerateCertificateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateStudentCertificate,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useEnsureStudentRoleMutation() {
  return useMutation({
    mutationFn: ensureStudentRoleForGroup,
  })
}

export function useRetakeFinalExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: retakeFinalExam,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useClearFinalExamHistoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearStudentFinalExamHistory,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useStoreFinalMarksMutation(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      marks: { student_id: number; practical: number | string }[]
      statement_date?: string
      statement_number?: string
    }) => storeGroupFinalMarks(groupId, payload),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useEditGroupMonitoringMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: editGroupMonitoring,
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useRefreshGroupDayAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, date }: { groupId: string; date: string }) =>
      refreshGroupDayAttendance(groupId, date),
    onSuccess: () => invalidateGroup(queryClient),
  })
}

export function useStoreStudentAbsenceReasonMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeStudentAbsenceReason,
    onSuccess: () => invalidateGroup(queryClient),
  })
}
