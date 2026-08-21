import { useQuery } from '@tanstack/react-query'
import { fetchPrintStudentsByGroup, fetchPrintTeachers, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function usePrintStudentsByGroupQuery(groupId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.documents.print(groupId ?? ''),
    queryFn: () => fetchPrintStudentsByGroup(groupId!),
    enabled: isAuthenticated && Boolean(groupId),
  })
}

export function usePrintTeachersQuery(groupId: string | undefined, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.documents.teachers(groupId ?? ''),
    queryFn: () => fetchPrintTeachers(groupId!),
    enabled: isAuthenticated && enabled && Boolean(groupId),
  })
}
