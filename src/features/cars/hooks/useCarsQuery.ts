import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCar,
  deleteCar,
  fetchCar,
  fetchCarCategories,
  fetchCarCounts,
  fetchCarCreateOptions,
  fetchCars,
  fetchTeachersForCar,
  queryKeys,
  updateCar,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { CarsFilters } from '@/types/cars'

export function useCarsQuery(filters: CarsFilters) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.list(filters),
    queryFn: () => fetchCars(filters),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useCarCountsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.counts(),
    queryFn: fetchCarCounts,
    enabled: isAuthenticated,
  })
}

export function useCarQuery(id: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.detail(id ?? ''),
    queryFn: () => fetchCar(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCarFormOptionsQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.options(),
    queryFn: async () => {
      const [options, teachers, categories] = await Promise.all([
        fetchCarCreateOptions(),
        fetchTeachersForCar(),
        fetchCarCategories(),
      ])
      return { ...options, teachers, categories }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeleteCarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })
    },
  })
}

export function useCreateCarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })
    },
  })
}

export function useUpdateCarMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateCar(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })
    },
  })
}
