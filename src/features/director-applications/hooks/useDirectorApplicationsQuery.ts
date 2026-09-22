import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  acceptDirectorApplication,
  cancelDirectorApplication,
  fetchDirectorApplications,
  isDefaultApplicationsParams,
  APPLICATIONS_SESSION_SHOW_COUNT,
  queryKeys,
} from '@/api'
import { canAccess } from '@/lib/authStorage'
import { notify } from '@/components/ui'
import { useAuth } from '@/features/auth'
import type {
  DirectorApplicationsParams,
  DirectorApplicationsPayload,
} from '@/types'

const SESSION_SHOW_COUNT = APPLICATIONS_SESSION_SHOW_COUNT

const ACCESS = ['view-external-application'] as const

function useCanViewApplications() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && canAccess(ACCESS, user)
}

/** Login / sidebar / default list — sessiyada 1 marta. */
export function useDirectorApplicationsSessionQuery(enabled = true) {
  const canView = useCanViewApplications()

  return useQuery({
    queryKey: queryKeys.directorApplications.session(),
    queryFn: () =>
      fetchDirectorApplications({
        page: 1,
        showCount: SESSION_SHOW_COUNT,
      }),
    enabled: enabled && canView,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** Sidebar badge + xabarlar count — session query dan. */
export function useDirectorApplicationsCountQuery(enabled = true) {
  const query = useDirectorApplicationsSessionQuery(enabled)
  return {
    count: Number(query.data?.status_counts?.received) || 0,
    isLoading: query.isLoading,
  }
}

function syncSessionCounts(
  queryClient: ReturnType<typeof useQueryClient>,
  payload: DirectorApplicationsPayload,
) {
  queryClient.setQueryData<DirectorApplicationsPayload>(
    queryKeys.directorApplications.session(),
    (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        status_counts: payload.status_counts,
      }
    },
  )
}

/** Sahifa ro‘yxati — default filtrda session keshini ulashadi. */
export function useDirectorApplicationsQuery(params: DirectorApplicationsParams) {
  const queryClient = useQueryClient()
  const canView = useCanViewApplications()
  const isDefault = isDefaultApplicationsParams(params)

  const session = useDirectorApplicationsSessionQuery(canView && isDefault)

  const filtered = useQuery({
    queryKey: queryKeys.directorApplications.list({
      page: params.page,
      showCount: params.showCount,
      state: params.state ?? '',
      search: params.search?.trim() ?? '',
      phone: params.phone?.trim() ?? '',
    }),
    queryFn: async () => {
      const payload = await fetchDirectorApplications(params)
      syncSessionCounts(queryClient, payload)
      return payload
    },
    enabled: canView && !isDefault,
    placeholderData: (prev) => prev,
  })

  if (isDefault) {
    return {
      data: session.data,
      isLoading: session.isLoading,
      isError: session.isError,
      error: session.error,
      refetch: session.refetch,
      isFetching: session.isFetching,
    }
  }

  return {
    data: filtered.data,
    isLoading: filtered.isLoading,
    isError: filtered.isError,
    error: filtered.error,
    refetch: filtered.refetch,
    isFetching: filtered.isFetching,
  }
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.directorApplications.all,
  })
}

export function useAcceptDirectorApplicationMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: number | string) => acceptDirectorApplication(id),
    onSuccess: async () => {
      notify.success(t('directorApplications.accepted'))
      await invalidateAll(queryClient)
    },
    onError: (err: Error) => {
      notify.error(err.message || t('common.loadError'))
    },
  })
}

export function useCancelDirectorApplicationMutation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      id,
      comment,
    }: {
      id: number | string
      comment?: string | null
    }) => cancelDirectorApplication(id, comment),
    onSuccess: async () => {
      notify.success(t('directorApplications.cancelled'))
      await invalidateAll(queryClient)
    },
    onError: (err: Error) => {
      notify.error(err.message || t('common.loadError'))
    },
  })
}

export const APPLICATIONS_NOTIF_ID = 'director-applications-received'

export function buildApplicationsNotification(count: number) {
  const n = Number(count) || 0
  if (n <= 0) return null
  return {
    id: APPLICATIONS_NOTIF_ID,
    is_read: 0 as const,
    announce: {
      title: "O'qish uchun yangi arizalar",
      body: `${n} ta yangi ariza kelib tushdi. Ko'rib chiqish uchun bosing.`,
      important: 1 as const,
    },
  }
}

export function isApplicationsNotification(id: string | number) {
  return String(id) === APPLICATIONS_NOTIF_ID
}
