import { useQuery } from '@tanstack/react-query'
import { fetchStudents, queryKeys } from '@/api'

/** Feature-level hook — pages import from features, not raw api. */
export function useStudentsQuery() {
  return useQuery({
    queryKey: queryKeys.students.lists(),
    queryFn: fetchStudents,
  })
}
