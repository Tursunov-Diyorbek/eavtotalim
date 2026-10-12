import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  fetchRegionalTeachers,
  setRegionalTeacherGaiStatus,
  type RegionalTeachersArgs,
} from '@/api/regional-teachers'
import { queryKeys } from '@/api/query-keys'
import { notify } from '@/components/ui'
import type { RegionalTeacher } from '@/types/regional-teachers'

export function useRegionalTeachersQuery(args: RegionalTeachersArgs) {
  return useQuery({
    queryKey: queryKeys.regionalTeachers.list(args),
    queryFn: () => fetchRegionalTeachers(args),
  })
}

export function useRegionalTeacherGaiMutation() {
  const { t } = useTranslation()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (row: RegionalTeacher) =>
      setRegionalTeacherGaiStatus(row.id, row.gaiStatus !== 1),
    onSuccess: async () => {
      notify.success(t('regionalTeachersPage.updated'))
      await client.invalidateQueries({ queryKey: queryKeys.regionalTeachers.all })
    },
    onError: (err: Error) => notify.error(err.message || t('regionalTeachersPage.failed')),
  })
}
