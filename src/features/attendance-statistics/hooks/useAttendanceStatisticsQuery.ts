import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchDailyAttendance,
  fetchGroupAbsence,
  fetchStudentAbsence,
  queryKeys,
  refreshDailyAttendance,
  type AttendancePageArgs,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useDailyAttendanceQuery(args: AttendancePageArgs, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.attendanceStatistics.daily(args),
    queryFn: () => fetchDailyAttendance(args),
    enabled: isAuthenticated && enabled && Boolean(args.date),
  })
}

export function useRefreshDailyAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => refreshDailyAttendance(date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendanceStatistics.dailyAll })
    },
  })
}

export function useGroupAbsenceQuery(args: AttendancePageArgs, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.attendanceStatistics.groups(args),
    queryFn: () => fetchGroupAbsence(args),
    enabled: isAuthenticated && enabled && Boolean(args.date),
  })
}

export function useStudentAbsenceQuery(args: AttendancePageArgs, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.attendanceStatistics.students(args),
    queryFn: () => fetchStudentAbsence(args),
    enabled: isAuthenticated && enabled && Boolean(args.date),
  })
}
