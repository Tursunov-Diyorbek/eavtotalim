import { useQuery } from '@tanstack/react-query'
import {
  allTestsLangId,
  fetchAllQuestionsByLanguage,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

export function useAllTestsQuery(params: {
  lang: string
  page: number
  showCount: number
  search: string
  enabled?: boolean
}) {
  const { isAuthenticated } = useAuth()
  const search = params.search.trim()
  const langId = allTestsLangId(params.lang)

  return useQuery({
    queryKey: queryKeys.allTests.list({
      langId,
      page: params.page,
      showCount: params.showCount,
      search,
    }),
    queryFn: () =>
      fetchAllQuestionsByLanguage({
        langId,
        page: params.page,
        showCount: params.showCount,
        search,
      }),
    enabled: isAuthenticated && (params.enabled ?? true),
    placeholderData: (prev) => prev,
  })
}
