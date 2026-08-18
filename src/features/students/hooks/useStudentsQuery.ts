import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteStudent,
  fetchDistricts,
  fetchExamCenterResults,
  fetchPracticalAttendances,
  fetchStudent,
  fetchStudentAttendanceLog,
  fetchStudentAutodromeAttendance,
  fetchStudentAutodromeStatus,
  fetchStudentCameraStatus,
  fetchStudentCertificates,
  fetchStudentClassDates,
  fetchStudentContract,
  fetchStudentCreateOptions,
  fetchStudentCounts,
  fetchStudentExamResults,
  fetchStudentPayments,
  fetchStudents,
  fetchStudentsWithoutCertificates,
  queryKeys,
  updateStudent,
  updateStudentAdditionalInfo,
  updateStudentSchoolInfo,
} from '@/api'
import { useAuth } from '@/features/auth'
import type {
  StudentAdditionalInfoPayload,
  StudentCertificateFilters,
  StudentSchoolInfoPayload,
  StudentsFilters,
  StudentWithoutCertificateFilters,
} from '@/types/student'

export function useStudentsQuery(filters: StudentsFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () => fetchStudents(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}

export function useStudentQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.detail(id ?? ''),
    queryFn: () => fetchStudent(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useStudentCreateOptionsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.options(),
    queryFn: fetchStudentCreateOptions,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateStudentMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateStudent(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export function useStudentCountsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.counts(),
    queryFn: fetchStudentCounts,
    enabled: isAuthenticated,
  })
}

export function useStudentCertificatesQuery(
  filters: StudentCertificateFilters,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.certificates(filters),
    queryFn: () => fetchStudentCertificates(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}

export function useStudentsWithoutCertificatesQuery(
  filters: StudentWithoutCertificateFilters,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.withoutCertificates(filters),
    queryFn: () => fetchStudentsWithoutCertificates(filters),
    enabled: isAuthenticated && enabled,
    placeholderData: (prev) => prev,
  })
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export function useStudentDistrictsQuery(regionId: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.districts(regionId),
    queryFn: () => fetchDistricts(regionId),
    enabled: isAuthenticated && Boolean(regionId),
  })
}

export function useStudentCameraStatusQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.camera(id ?? ''),
    queryFn: () => fetchStudentCameraStatus(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useStudentAutodromeStatusQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.autodromeCamera(id ?? ''),
    queryFn: () => fetchStudentAutodromeStatus(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useStudentAttendanceLogQuery(
  id: string | undefined,
  page = 1,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.attendance(id ?? '', page),
    queryFn: () => fetchStudentAttendanceLog(id!, 10, page),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useStudentAutodromeAttendanceQuery(
  id: string | undefined,
  page = 1,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.autodromeAttendance(id ?? '', page),
    queryFn: () => fetchStudentAutodromeAttendance(id!, 10, page),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useStudentPaymentsQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.payments(id ?? ''),
    queryFn: () => fetchStudentPayments(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useStudentExamResultsQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.exams(id ?? ''),
    queryFn: () => fetchStudentExamResults(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useStudentContractQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.contract(id ?? ''),
    queryFn: () => fetchStudentContract(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useExamCenterResultsQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.examCenter(id ?? ''),
    queryFn: () => fetchExamCenterResults(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function usePracticalAttendancesQuery(id: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.practical(id ?? ''),
    queryFn: () => fetchPracticalAttendances(id!),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useStudentClassDatesQuery(
  id: string | undefined,
  fromDate?: string,
  toDate?: string,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.classDates(id ?? '', fromDate, toDate),
    queryFn: () => fetchStudentClassDates(id!, fromDate, toDate),
    enabled: isAuthenticated && Boolean(id) && enabled,
  })
}

export function useUpdateStudentSchoolInfoMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentSchoolInfoPayload) =>
      updateStudentSchoolInfo(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
    },
  })
}

export function useUpdateStudentAdditionalInfoMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentAdditionalInfoPayload) =>
      updateStudentAdditionalInfo(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
    },
  })
}
