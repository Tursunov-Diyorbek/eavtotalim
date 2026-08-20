import { useQuery } from '@tanstack/react-query'
import {
  fetchContentViewGroups,
  fetchContentViewStudents,
  fetchContentViewStudentTopics,
  fetchTemplateTestStats,
  fetchTemplateTestStudentResults,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useTemplateTestStatsQuery(filters: {
  page: number
  showCount: number
  studentSearch: string
  groupSearch: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorStats.templateTests(filters),
    queryFn: () => fetchTemplateTestStats(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useTemplateTestStudentResultsQuery(
  studentId: string | undefined,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorStats.templateTestStudent(studentId ?? ''),
    queryFn: () => fetchTemplateTestStudentResults(studentId!),
    enabled: isAuthenticated && Boolean(studentId),
  })
}

export function useContentViewGroupsQuery(filters: {
  page: number
  showCount: number
  eduStatus: string
}) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorStats.contentGroups(filters),
    queryFn: () => fetchContentViewGroups(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useContentViewStudentsQuery(groupId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorStats.contentStudents(groupId ?? ''),
    queryFn: () => fetchContentViewStudents({ groupId: groupId! }),
    enabled: isAuthenticated && Boolean(groupId),
  })
}

export function useContentViewStudentTopicsQuery(studentId: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.directorStats.contentStudentTopics(studentId ?? ''),
    queryFn: () => fetchContentViewStudentTopics(studentId!),
    enabled: isAuthenticated && Boolean(studentId),
  })
}
