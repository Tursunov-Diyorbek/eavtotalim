import { useQuery } from '@tanstack/react-query'
import {
  fetchAvailableGroupCars,
  fetchFinalExamByGroup,
  fetchFinalExamResults,
  fetchGroupCars,
  fetchGroupCredentials,
  fetchGroupFinalMarks,
  fetchGroupIncomingStudents,
  fetchGroupMonitoring,
  fetchGroupPayments,
  fetchGroupRemovedStudents,
  fetchGroupShow,
  fetchGroupShowStudents,
  fetchGroupTeachers,
  fetchGroupTeacherTypes,
  fetchGroupTimetable,
  fetchGroupUngroupedStudents,
  fetchTeachersForGroupMerge,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useGroupShowQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.detail(id ?? ''),
    queryFn: () => fetchGroupShow(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useGroupShowStudentsQuery(
  id: string | undefined,
  enabled = true,
  showCount = 50,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...queryKeys.groups.students(id ?? ''), showCount] as const,
    queryFn: () => fetchGroupShowStudents(id!, 1, showCount),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupTimetableQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.timetable(id ?? ''),
    queryFn: () => fetchGroupTimetable(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupCarsQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.cars(id ?? ''),
    queryFn: () => fetchGroupCars(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupTeachersQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.teachers(id ?? ''),
    queryFn: () => fetchGroupTeachers(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupRemovedStudentsQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.removedStudents(id ?? ''),
    queryFn: () => fetchGroupRemovedStudents(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupCredentialsQuery(id: string | undefined, enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.credentials(id ?? ''),
    queryFn: () => fetchGroupCredentials(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupIncomingStudentsQuery(
  id: string | undefined,
  year: number,
  month: number,
  search: string,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.incoming(id ?? '', year, month, search),
    queryFn: () => fetchGroupIncomingStudents(id!, year, month, search),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupFinalExamQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.finalExam(id ?? ''),
    queryFn: () => fetchFinalExamByGroup(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useGroupUngroupedStudentsQuery(id: string | undefined, enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.ungrouped(id ?? ''),
    queryFn: () => fetchGroupUngroupedStudents(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useAvailableGroupCarsQuery(id: string | undefined, enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.availableCars(id ?? ''),
    queryFn: () => fetchAvailableGroupCars(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupTeacherTypesQuery(id: string | undefined, enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.teacherTypes(id ?? ''),
    queryFn: () => fetchGroupTeacherTypes(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useMergeTeachersQuery(enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.mergeTeachers(),
    queryFn: fetchTeachersForGroupMerge,
    enabled: isAuthenticated && enabled,
  })
}

export function useGroupMonitoringQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.monitoring(id ?? ''),
    queryFn: () => fetchGroupMonitoring(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useGroupPaymentsQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.payments(id ?? ''),
    queryFn: () => fetchGroupPayments(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useGroupFinalMarksQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.finalMarks(id ?? ''),
    queryFn: () => fetchGroupFinalMarks(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useFinalExamResultsQuery(examId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.examResults(examId ?? ''),
    queryFn: () => fetchFinalExamResults(examId!),
    enabled: isAuthenticated && Boolean(examId),
  })
}
