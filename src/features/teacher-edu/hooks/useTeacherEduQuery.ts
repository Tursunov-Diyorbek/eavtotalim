import { useQuery } from '@tanstack/react-query'
import {
  fetchTeacherEduContents,
  fetchTeacherEduLessons,
  fetchTeacherEduTopics,
  fetchTeacherEduTypes,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useTeacherEduTypesQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teacherEdu.types(),
    queryFn: fetchTeacherEduTypes,
    enabled: isAuthenticated,
  })
}

export function useTeacherEduLessonsQuery(eduTypeId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = eduTypeId ?? ''
  return useQuery({
    queryKey: queryKeys.teacherEdu.lessons(id),
    queryFn: () => fetchTeacherEduLessons(id),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useTeacherEduTopicsQuery(lessonId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = lessonId ?? ''
  return useQuery({
    queryKey: queryKeys.teacherEdu.topics(id),
    queryFn: () => fetchTeacherEduTopics(id),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useTeacherEduContentsQuery(topicId: string | undefined) {
  const { isAuthenticated } = useAuth()
  const id = topicId ?? ''
  return useQuery({
    queryKey: queryKeys.teacherEdu.content(id),
    queryFn: () => fetchTeacherEduContents(id),
    enabled: isAuthenticated && Boolean(id),
  })
}
