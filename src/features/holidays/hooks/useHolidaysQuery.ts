import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createHoliday, deleteHoliday, fetchHolidays, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

export function useHolidaysQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.holidays.list(),
    queryFn: fetchHolidays,
    enabled: isAuthenticated,
  })
}

export function useCreateHolidayMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}

export function useDeleteHolidayMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
    },
  })
}
