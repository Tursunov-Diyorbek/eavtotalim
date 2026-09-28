import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchCameraPendingStudents, queryKeys } from '@/api'
import { useAuth } from '@/features/auth'

const BREAKDOWN = [
  { key: 'sent', status: '3' },
  { key: 'sending', status: '1' },
  { key: 'error', status: '5' },
  { key: 'old', status: '8' },
] as const

export function useCameraPendingStudentsQuery(filters: {
  page: number
  showCount: number
  groupId: string
  status: string
  search: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cameraAttendance.list(filters),
    queryFn: () => fetchCameraPendingStudents(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

/** Filtrsiz jami — jadval holati tanlangan bo‘lsa ham yuqori raqamlar o‘zgarmaydi. */
export function useCameraPendingSummaryQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cameraAttendance.summary(),
    queryFn: () =>
      fetchCameraPendingStudents({
        page: 1,
        showCount: 1,
        groupId: '',
        status: '',
        search: '',
      }),
    enabled: isAuthenticated,
  })
}

/** Yuborilgan / yuborilmoqda / xato — har bir holatning `total_items` i. */
export function useCameraPendingBreakdownQuery() {
  const { isAuthenticated } = useAuth()
  return useQueries({
    queries: BREAKDOWN.map((item) => ({
      queryKey: queryKeys.cameraAttendance.count(item.status),
      queryFn: () =>
        fetchCameraPendingStudents({
          page: 1,
          showCount: 1,
          groupId: '',
          status: item.status,
          search: '',
        }),
      enabled: isAuthenticated,
    })),
  })
}

