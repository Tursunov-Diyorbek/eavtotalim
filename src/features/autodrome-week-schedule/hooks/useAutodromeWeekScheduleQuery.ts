import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  attachGroupToWeekday,
  detachGroupFromWeekday,
  fetchAttachedScheduleGroups,
  fetchAutodromeWeekDays,
  fetchScheduleGroups,
  queryKeys,
  updateGroupWeekSchedule,
  type AttachedGroupFilters,
  type ScheduleListFilters,
} from '@/api'
import { notify } from '@/components/ui'
import { useAuth } from '@/features/auth'

function useInvalidateWeek() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.autodromeWeekSchedule.all })
}

export function useAutodromeWeekDaysQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeWeekSchedule.days(),
    queryFn: fetchAutodromeWeekDays,
    enabled: isAuthenticated,
  })
}

export function useScheduleGroupsQuery(filters: ScheduleListFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeWeekSchedule.list(filters),
    queryFn: () => fetchScheduleGroups(filters),
    enabled: enabled && isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useAttachedScheduleGroupsQuery(filters: AttachedGroupFilters, enabled = true) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeWeekSchedule.attached(filters),
    queryFn: () => fetchAttachedScheduleGroups(filters),
    enabled: enabled && isAuthenticated && filters.day > 0,
    placeholderData: (prev) => prev,
  })
}

export function useAutodromeWeekMutations() {
  const { t } = useTranslation()
  const invalidate = useInvalidateWeek()
  const onError = (err: unknown) => {
    notify.error(err instanceof Error ? err.message : t('autodromeWeekPage.failed'))
  }

  const attach = useMutation({
    mutationFn: attachGroupToWeekday,
    onSuccess: async () => {
      await invalidate()
      notify.success(t('autodromeWeekPage.attached'))
    },
    onError,
  })

  const detach = useMutation({
    mutationFn: detachGroupFromWeekday,
    onSuccess: async () => {
      await invalidate()
      notify.success(t('autodromeWeekPage.detached'))
    },
    onError,
  })

  const updateSchedule = useMutation({
    mutationFn: updateGroupWeekSchedule,
    onSuccess: async () => {
      await invalidate()
      notify.success(t('autodromeWeekPage.saved'))
    },
    onError,
  })

  return { attach, detach, updateSchedule, invalidate }
}
