import { apiClient, apiClientV2 } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  CarCounts,
  CarCreateOptions,
  CarDetail,
  CarItem,
  CarsFilters,
  NamedOption,
} from '@/types/cars'

/** GET v2 /cars/get-car-counts */
export async function fetchCarCounts(): Promise<CarCounts> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: CarCounts
    message?: string
  }>('/cars/get-car-counts')
  assertOk(res)
  return res.data ?? {}
}

/** GET v2 /cars */
export async function fetchCars(filters: CarsFilters) {
  const filterItems: FilterItem[] = []
  const name = filters.name?.trim()
  if (name) {
    filterItems.push({
      fieldKey: 'name',
      fieldOperator: 'LIKE',
      fieldValue: `%${name}%`,
    })
  }
  const number = filters.number?.trim()
  if (number) {
    filterItems.push({
      fieldKey: 'number',
      fieldOperator: 'LIKE',
      fieldValue: `%${number}%`,
    })
  }
  if (filters.status !== undefined && filters.status !== '') {
    filterItems.push({
      fieldKey: 'status',
      fieldOperator: '=',
      fieldValue: filters.status,
    })
  }
  if (filters.gaiStatus !== undefined && filters.gaiStatus !== '') {
    filterItems.push({
      fieldKey: 'gai_status',
      fieldOperator: '=',
      fieldValue: filters.gaiStatus,
    })
  }
  if (filters.mspdStatus !== undefined && filters.mspdStatus !== '') {
    filterItems.push({
      fieldKey: 'mspd_status',
      fieldOperator: '=',
      fieldValue: filters.mspdStatus,
    })
  }
  if (filters.eduTypeId != null) {
    filterItems.push({
      fieldKey: 'edu_type_id',
      fieldOperator: '=',
      fieldValue: filters.eduTypeId,
    })
  }

  const extra: Record<string, string> = {}
  extra['relations[0]'] = 'group_cars'
  extra['relations[1]'] = 'organization'

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: filterItems,
    sort: [{ fieldKey: 'id', fieldValue: 'DESC' }],
    extra,
  })

  const res = await apiClientV2.get<Record<string, unknown>>(`/cars?${query}`)
  assertOk(res)
  return unwrapPage<CarItem>(res, filters.page, filters.showCount)
}

export async function deleteCar(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/cars/${id}`)
  assertOk(res)
  return res
}

/** GET v2 /cars/show/:id */
export async function fetchCar(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/cars/show/${id}`)
  assertOk(res)
  return unwrapEntity<CarDetail>(res)
}

/** GET v2 /cars/create */
export async function fetchCarCreateOptions(): Promise<CarCreateOptions> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/cars/create?show_count=all',
  )
  const data = unwrapEntity<CarCreateOptions>(res)
  return {
    car_models: asNamedList(data.car_models),
    car_types: asNamedList(data.car_types),
    car_colors: asNamedList(data.car_colors),
    years: asNamedList(data.years),
    fuel_types: asNamedList(data.fuel_types),
    yhx_managements: asNamedList(data.yhx_managements),
  }
}

/** GET v2 /cars/index-teachers-for-cars */
export async function fetchTeachersForCar(): Promise<NamedOption[]> {
  const res = await apiClientV2.get<unknown>(
    '/cars/index-teachers-for-cars?show_count=all',
  )
  return asNamedList<NamedOption>(unwrapEntity(res) ?? res)
}

/** GET v2 /cars/car-categories */
export async function fetchCarCategories(): Promise<NamedOption[]> {
  const res = await apiClientV2.get<unknown>('/cars/car-categories')
  return asNamedList<NamedOption>(unwrapEntity(res) ?? res)
}

function assertCarSaved(res: {
  status?: number | boolean
  ok?: number
  message?: string
  error?: string
}) {
  if (res.ok === 0 || res.status === 0 || res.status === false || res.status === 2) {
    throw new Error(res.error || res.message || 'Validation error')
  }
}

/** POST v1 /cars (FormData) */
export async function createCar(formData: FormData) {
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
    error?: string
  }>('/cars', formData)
  assertCarSaved(res)
  return res
}

/** POST v1 /cars/update/:id (FormData) */
export async function updateCar(id: string, formData: FormData) {
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
    error?: string
  }>(`/cars/update/${id}`, formData)
  assertCarSaved(res)
  return res
}
