import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCar,
  deleteCar,
  disableCar,
  enableCar,
  fetchCar,
  fetchCarCategories,
  fetchCarCounts,
  fetchCarCreateOptions,
  fetchCarDetails,
  fetchTeacherCars,
  updateCarDetails,
  fetchCarEducationalHistory,
  setCarEducational,
  fetchCarStatistics,
  fetchCars,
  fetchEducationalShare,
  fetchMspdReferences,
  downloadCarsExport,
  fetchTeachersForCar,
  queryKeys,
  recheckCarMspd,
  unmergeTeacherFromCar,
  changeTeacherOnCar,
  changeCarCategory,
  updateCar,
} from '@/api'
import { useAuth } from '@/features/auth'
import type { CarDetailsPayload, CarsFilters } from '@/types/cars'

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

export function useTeacherCarsQuery(teacherId?: number) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.teacher(teacherId ?? 0),
    queryFn: () => fetchTeacherCars(teacherId!),
    enabled: isAuthenticated && Boolean(teacherId),
  })
}

export function useUpdateCarDetailsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; payload: CarDetailsPayload }) =>
      updateCarDetails(args.id, args.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })
    },
  })
}

export function useCarDetailsQuery(id?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.info(id ?? ''),
    queryFn: () => fetchCarDetails(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useCarEducationalHistoryQuery(id?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.eduHistory(id ?? ''),
    queryFn: () => fetchCarEducationalHistory(id!),
    enabled: isAuthenticated && Boolean(id),
  })
}

export function useSetCarEducationalMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { override: number | null; reason: string }) =>
      setCarEducational(id, payload),
    onSuccess: () => invalidateCar(queryClient),
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

function invalidateCar(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })
}

export function useRecheckCarMspdMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recheckCarMspd,
    onSuccess: () => invalidateCar(queryClient),
  })
}

export function useEnableCarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enableCar,
    onSuccess: () => invalidateCar(queryClient),
  })
}

export function useDisableCarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disableCar,
    onSuccess: () => invalidateCar(queryClient),
  })
}

export function useUnmergeCarTeacherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ carId, teacherId }: { carId: number; teacherId: number }) =>
      unmergeTeacherFromCar(carId, teacherId),
    onSuccess: () => invalidateCar(queryClient),
  })
}

export function useChangeCarTeacherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ carId, teacherId }: { carId: number; teacherId: number }) =>
      changeTeacherOnCar(carId, teacherId),
    onSuccess: () => invalidateCar(queryClient),
  })
}

export function useEducationalShareQuery(args: { status?: string; mspdStatus?: string }) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.share(args),
    queryFn: () => fetchEducationalShare(args),
    enabled: isAuthenticated,
  })
}

export function useMspdReferencesQuery(enabled: boolean) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.refs(),
    queryFn: fetchMspdReferences,
    enabled: isAuthenticated && enabled,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCarStatisticsQuery(
  args: { status?: string; mspdStatus?: string },
  enabled: boolean,
) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cars.statistics(args),
    queryFn: () => fetchCarStatistics(args),
    enabled: isAuthenticated && enabled,
  })
}

export function useExportCarsMutation() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters: CarsFilters; format: 'csv' | 'xlsx' }) =>
      downloadCarsExport(filters, format),
  })
}

export function useChangeCarCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ carId, categoryId }: { carId: string; categoryId: number }) =>
      changeCarCategory(carId, categoryId),
    onSuccess: () => invalidateCar(queryClient),
  })
}
