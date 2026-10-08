import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTeacher,
  fetchTeacher,
  fetchTeacherCreateOptions,
  fetchTeacherEdit,
  fetchTeachers,
  queryKeys,
  updateTeacher,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { TeachersFilters } from '@/types/teachers'

export function useTeachersQuery(filters: TeachersFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => fetchTeachers(filters),
    enabled: isAuthenticated,
  })
}

export function useTeacherQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teachers.detail(id ?? ''),
    queryFn: () => fetchTeacher(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useTeacherEditQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teachers.edit(id ?? ''),
    queryFn: () => fetchTeacherEdit(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useTeacherCreateOptionsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.teachers.options(),
    queryFn: fetchTeacherCreateOptions,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTeacherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all })
    },
  })
}

export function useUpdateTeacherMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateTeacher(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all })
    },
  })
}
