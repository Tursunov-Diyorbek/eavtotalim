import { useQuery } from '@tanstack/react-query'
import {
  fetchMonitoringStudentAbsences,
  fetchMonitoringStudents,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useMonitoringStudentsQuery(filters: {
  page: number
  showCount: number
  name: string
  groupName: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.monitoringReport.list(filters),
    queryFn: () => fetchMonitoringStudents(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useMonitoringStudentAbsencesQuery(args: {
  studentId: string | undefined
  page: number
  showCount: number
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.monitoringReport.show(args),
    queryFn: () =>
      fetchMonitoringStudentAbsences({
        studentId: args.studentId!,
        page: args.page,
        showCount: args.showCount,
      }),
    enabled: isAuthenticated && Boolean(args.studentId),
    placeholderData: (prev) => prev,
  })
}
