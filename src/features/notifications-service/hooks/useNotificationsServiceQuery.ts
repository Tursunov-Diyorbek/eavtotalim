import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMessageTemplate,
  deleteMessageTemplate,
  fetchMessageScheduleStudents,
  fetchMessageSchedules,
  fetchMessageTemplates,
  fetchNotificationStudents,
  queryKeys,
  sendScheduledMessage,
  updateMessageTemplate,
  type SendMode,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useMessageSchedulesQuery(page: number, showCount: number) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.notificationsService.list({ page, showCount }),
    queryFn: () => fetchMessageSchedules(page, showCount),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useMessageScheduleStudentsQuery(
  id: number | null,
  page: number,
  showCount: number,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.notificationsService.detail(id ?? 0, { page, showCount }),
    queryFn: () => fetchMessageScheduleStudents(id!, page, showCount),
    enabled: isAuthenticated && id != null,
  })
}

export function useMessageTemplatesQuery(page: number, showCount: number | 'all') {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.notificationsService.templates({ page, showCount }),
    queryFn: () => fetchMessageTemplates(page, showCount),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  })
}

export function useNotificationStudentsQuery(args: {
  mode: SendMode
  groupId?: number
  page: number
  showCount: number
  enabled?: boolean
}) {
  const { isAuthenticated } = useAuth()
  const needsGroup = args.mode !== 'birthday'
  return useQuery({
    queryKey: queryKeys.notificationsService.students(args),
    queryFn: () => fetchNotificationStudents(args),
    enabled:
      isAuthenticated &&
      (args.enabled ?? true) &&
      (!needsGroup || Boolean(args.groupId)),
  })
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.notificationsService.all,
  })
  void queryClient.invalidateQueries({ queryKey: queryKeys.directorLists.all })
}

export function useCreateMessageTemplateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMessageTemplate,
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useUpdateMessageTemplateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: { name: string; body: string }
    }) => updateMessageTemplate(id, payload),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useDeleteMessageTemplateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMessageTemplate,
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useSendScheduledMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendScheduledMessage,
    onSuccess: () => invalidateAll(queryClient),
  })
}
