import { useQuery } from '@tanstack/react-query'
import { fetchMyTimeTable, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useMyTimeTableQuery(enabled = true) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: queryKeys.schedule.myTimeTable(),
    queryFn: fetchMyTimeTable,
    enabled: isAuthenticated && enabled,
  })
}
