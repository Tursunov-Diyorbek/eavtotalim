import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  queryKeys,
  saveStudentTopic,
  unsaveStudentTopic,
} from '@/api'
import type { SavedTopicItem } from '@/types'
import { resolveSavedTopicId } from '../utils'

type ToggleArgs = {
  topicId: number
  save: boolean
  /** Saqlangan yozuv id (v1 delete uchun) */
  savedId?: number | null
}

export function useToggleSavedTopicMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ topicId, save, savedId }: ToggleArgs) => {
      if (save) await saveStudentTopic(topicId)
      else await unsaveStudentTopic({ topicId, savedId })
    },
    onMutate: async ({ topicId, save, savedId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.lessons.savedTopics(),
      })
      const prev = queryClient.getQueryData<SavedTopicItem[]>(
        queryKeys.lessons.savedTopics(),
      )

      if (!save && prev) {
        queryClient.setQueryData<SavedTopicItem[]>(
          queryKeys.lessons.savedTopics(),
          prev.filter((item) => {
            if (savedId != null && item.id === savedId) return false
            return resolveSavedTopicId(item) !== topicId
          }),
        )
      }

      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.lessons.savedTopics(), ctx.prev)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lessons.savedTopics(),
      })
    },
  })
}
