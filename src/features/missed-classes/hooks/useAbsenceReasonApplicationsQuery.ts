import { useQuery } from '@tanstack/react-query'
import { fetchAbsenceReasonApplications, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useAbsenceReasonApplicationsQuery(
  professionId: number | null | undefined,
  enabled = true,
) {
  const { isAuthenticated } = useAuth()
  const id = professionId != null ? Number(professionId) : null

  return useQuery({
    queryKey: queryKeys.missedClasses.absenceReasons(id ?? 0),
    queryFn: () => fetchAbsenceReasonApplications(id!),
    enabled: isAuthenticated && enabled && id != null && id > 0,
  })
}
