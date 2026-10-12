import { keepPreviousData, QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      // Filtr yoki sahifa o‘zgaganda eski qatorlar turadi — Table Lottie loader chiqaradi.
      placeholderData: keepPreviousData,
    },
  },
})
