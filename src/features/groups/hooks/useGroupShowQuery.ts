import { useQuery } from '@tanstack/react-query'
import { fetchGroupShow, fetchGroupShowStudents, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useGroupShowQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.detail(id ?? ''),
    queryFn: () => fetchGroupShow(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useGroupShowStudentsQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.groups.students(id ?? ''),
    queryFn: () => fetchGroupShowStudents(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}
