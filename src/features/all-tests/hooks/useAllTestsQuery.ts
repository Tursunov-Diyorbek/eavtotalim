import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  allTestsLangId,
  fetchAllQuestionsByLanguage,
  queryKeys,
} from '@/api'
import { useAuth } from '@/features/auth'

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export function useAllTestsQuery(params: {
  lang: string
  page: number
  showCount: number
  search: string
  enabled?: boolean
}) {
  const { isAuthenticated } = useAuth()
  const debouncedSearch = useDebouncedValue(params.search.trim(), 500)
  const langId = allTestsLangId(params.lang)

  return useQuery({
    queryKey: queryKeys.allTests.list({
      langId,
      page: params.page,
      showCount: params.showCount,
      search: debouncedSearch,
    }),
    queryFn: () =>
      fetchAllQuestionsByLanguage({
        langId,
        page: params.page,
        showCount: params.showCount,
        search: debouncedSearch,
      }),
    enabled: isAuthenticated && (params.enabled ?? true),
    placeholderData: (prev) => prev,
  })
}
