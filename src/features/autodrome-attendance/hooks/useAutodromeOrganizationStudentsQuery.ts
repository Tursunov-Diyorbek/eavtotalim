import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAutodromeOrganizationStudents,
  queryKeys,
  resendAutodromeOrganizationStudent,
  returnAutodromeStudentRealImage,
  updateAutodromeStudentImage,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAutodromeOrganizationStudentsQuery(filters: {
  groupId: string
  word: string
  page: number
  showCount: number
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.autodromeAttendance.connected(filters),
    queryFn: () => fetchAutodromeOrganizationStudents(filters),
    enabled: isAuthenticated && Boolean(filters.groupId),
    placeholderData: (prev) => prev,
  })
}

function useInvalidateConnected() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.autodromeAttendance.all, 'connected'],
    })
}

export function useUpdateAutodromeStudentImageMutation() {
  const invalidate = useInvalidateConnected()
  return useMutation({
    mutationFn: ({ id, image }: { id: number; image: File }) =>
      updateAutodromeStudentImage(id, image),
    onSuccess: invalidate,
  })
}

export function useReturnAutodromeStudentImageMutation() {
  const invalidate = useInvalidateConnected()
  return useMutation({
    mutationFn: (id: number) => returnAutodromeStudentRealImage(id),
    onSuccess: invalidate,
  })
}

export function useResendAutodromeStudentMutation() {
  const invalidate = useInvalidateConnected()
  return useMutation({
    mutationFn: (id: number) => resendAutodromeOrganizationStudent(id),
    onSuccess: invalidate,
  })
}
