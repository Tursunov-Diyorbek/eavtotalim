import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  createRegionRoadSafety,
  deleteRegionRoadSafety,
  fetchRegionRoadSafety,
  updateRegionRoadSafety,
  type RegionRoadSafetyInput,
} from '@/api/region-road-safety'
import { queryKeys } from '@/api/query-keys'
import { notify } from '@/components/ui'

export function useRegionRoadSafetyQuery() {
  return useQuery({
    queryKey: queryKeys.regionRoadSafety.list(),
    queryFn: fetchRegionRoadSafety,
  })
}

export function useRegionRoadSafetyMutations() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.regionRoadSafety.all })

  const create = useMutation({
    mutationFn: (input: RegionRoadSafetyInput) => createRegionRoadSafety(input),
    onSuccess: async () => {
      notify.success(t('regionRoadPage.saved'))
      await refresh()
    },
    onError: (err: Error) => notify.error(err.message || t('regionRoadPage.failed')),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: RegionRoadSafetyInput }) =>
      updateRegionRoadSafety(id, input),
    onSuccess: async () => {
      notify.success(t('regionRoadPage.updated'))
      await refresh()
    },
    onError: (err: Error) => notify.error(err.message || t('regionRoadPage.failed')),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteRegionRoadSafety(id),
    onSuccess: async () => {
      notify.success(t('regionRoadPage.deleted'))
      await refresh()
    },
    onError: (err: Error) => notify.error(err.message || t('regionRoadPage.failed')),
  })

  return { create, update, remove }
}
