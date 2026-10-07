import { useQuery } from '@tanstack/react-query'
import {
  fetchGroupJournalLessons,
  fetchPracticalChapters,
  fetchPrintStudentsByGroup,
  fetchPrintTeachers,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function usePrintStudentsByGroupQuery(groupId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.documents.print(groupId ?? ''),
    queryFn: () => fetchPrintStudentsByGroup(groupId!),
    enabled: isAuthenticated && Boolean(groupId),
  })
}

export function useGroupJournalLessonsQuery(groupId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.documents.lessons(groupId ?? ''),
    queryFn: () => fetchGroupJournalLessons(groupId!),
    enabled: isAuthenticated && Boolean(groupId),
  })
}

export function usePracticalChaptersQuery(lessonId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.documents.practicalChapters(lessonId ?? ''),
    queryFn: () => fetchPracticalChapters(lessonId!),
    enabled: isAuthenticated && Boolean(lessonId),
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
