import { apiClient, apiClientV2 } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import { env } from '@/config/env'
import { getAccessToken } from '@/lib/authStorage'
import type {
  CarCounts,
  CarCreateOptions,
  CarTeacherOption,
  CarDetail,
  CarItem,
  CarEducationalHistoryItem,
  CarDetailsPayload,
  CarOperationalInfo,
  TeacherCar,
  CarStatistics,
  CarsFilters,
  EducationalShare,
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
  if (filters.organizationId) {
    filterItems.push({
      fieldKey: 'organization_id',
      fieldOperator: '=',
      fieldValue: filters.organizationId,
    })
  }
  if (filters.eduTypeId != null) {
    filterItems.push({
      fieldKey: 'edu_type_id',
      fieldOperator: '=',
      fieldValue: filters.eduTypeId,
    })
  }
  if (filters.mspdTypeId != null) {
    filterItems.push({
      fieldKey: 'mspd_type_id',
      fieldOperator: '=',
      fieldValue: filters.mspdTypeId,
    })
  }
  if (filters.mspdBodyTypeId != null) {
    filterItems.push({
      fieldKey: 'mspd_body_type_id',
      fieldOperator: '=',
      fieldValue: filters.mspdBodyTypeId,
    })
  }
  if (filters.educational === '0' || filters.educational === '1') {
    filterItems.push({
      fieldKey: 'educational',
      fieldOperator: '=',
      fieldValue: filters.educational,
    })
  }
  if (filters.regionId) {
    filterItems.push({
      fieldKey: 'organization.region_id',
      fieldOperator: '=',
      fieldValue: filters.regionId,
    })
  }
  if (filters.areaId) {
    filterItems.push({
      fieldKey: 'area_id',
      fieldOperator: '=',
      fieldValue: filters.areaId,
    })
  }
  const inn = filters.inn?.trim()
  if (inn) {
    filterItems.push({
      fieldKey: 'organization.inn',
      fieldOperator: '=',
      fieldValue: inn,
    })
  }
  if (filters.categoryId) {
    filterItems.push({
      fieldKey: 'car_category_id',
      fieldOperator: '=',
      fieldValue: filters.categoryId,
    })
  }

  const extra: Record<string, string> = {}
  extra['relations[0]'] = 'group_cars'
  extra['relations[1]'] = 'organization'
  if (filters.includeArea) extra['relations[2]'] = 'area'

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

/** GET v2 /cars/:id/educational-history */
export async function fetchCarEducationalHistory(
  id: string,
): Promise<CarEducationalHistoryItem[]> {
  try {
    const res = await apiClientV2.get<{ status?: number; data?: unknown }>(
      `/cars/${id}/educational-history`,
    )
    if (res.status != null && Number(res.status) !== 1) return []
    return asNamedList<CarEducationalHistoryItem>(res.data ?? res)
  } catch {
    return []
  }
}

/** POST v2 /cars/:id/educational — qo‘lda o‘quv belgisi. */
export async function setCarEducational(
  id: string,
  payload: { override: number | null; reason: string },
) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/cars/${id}/educational`,
    payload,
  )
  assertOk(res)
  return res
}

/** GET v2 /teachers/:id/car */
export async function fetchTeacherCars(teacherId: number): Promise<TeacherCar[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(`/teachers/${teacherId}/car`)
  assertOk(res)
  const data = res.data
  if (Array.isArray(data)) return data as TeacherCar[]
  if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>
    if (Array.isArray(rec.data)) return rec.data as TeacherCar[]
    if (rec.id != null) return [data as TeacherCar]
  }
  return []
}

/** POST v2 /cars/:id/details */
export async function updateCarDetails(id: string, payload: CarDetailsPayload) {
  const res = await apiClientV2.post<{
    status?: number | boolean | string
    message?: string
  }>(`/cars/${id}/details`, payload)
  assertOk(res)
  return res
}

/** GET v2 /cars/:id/details — yurgan masofa, holat izohi, moy va shina. */
export async function fetchCarDetails(id: string): Promise<CarOperationalInfo | null> {
  try {
    const res = await apiClientV2.get<Record<string, unknown>>(`/cars/${id}/details`)
    const data = unwrapEntity<CarOperationalInfo>(res)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

/** GET v2 /cars/create */
export async function fetchCarCreateOptions(): Promise<CarCreateOptions> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/cars/create?show_count=all',
  )
  const data = unwrapEntity<CarCreateOptions & Record<string, unknown>>(res)
  return {
    car_models: asNamedList(data.car_models),
    car_types: asNamedList(data.car_types),
    car_colors: asNamedList(data.car_colors),
    years: asNamedList(data.years),
    fuel_types: asNamedList(data.fuel_types),
    yhx_managements: asNamedList(data.yhx_managements),
    can_set_car_category_manually: Boolean(data.can_set_car_category_manually),
    tram_category_id:
      data.tram_category_id == null || data.tram_category_id === ''
        ? null
        : (data.tram_category_id as number | string),
  }
}

/** GET v2 /cars/index-teachers-for-cars */
export async function fetchTeachersForCar(): Promise<CarTeacherOption[]> {
  const res = await apiClientV2.get<unknown>(
    '/cars/index-teachers-for-cars?show_count=all',
  )
  return asNamedList<CarTeacherOption>(unwrapEntity(res) ?? res)
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

/** GET v2 /cars/educational-share */
export async function fetchEducationalShare(args: {
  status?: string
  mspdStatus?: string
}) {
  const extra: Record<string, string> = {}
  if (args.status !== undefined && args.status !== '') extra.status = args.status
  if (args.mspdStatus !== undefined && args.mspdStatus !== '') extra.mspd_status = args.mspdStatus
  const qs = buildListQuery({ extra })
  const res = await apiClientV2.get<{ status?: number; data?: EducationalShare }>(
    `/cars/educational-share${qs ? `?${qs}` : ''}`,
  )
  return res.data ?? {}
}

/** GET v2 /cars/mspd-references */
export async function fetchMspdReferences() {
  const res = await apiClientV2.get<{
    data?: { types?: NamedOption[]; body_types?: NamedOption[] }
  }>('/cars/mspd-references')
  return {
    types: asNamedList(res.data?.types),
    bodyTypes: asNamedList(res.data?.body_types),
  }
}

/** GET v2 /cars/statistics */
export async function fetchCarStatistics(args: {
  status?: string
  mspdStatus?: string
}) {
  const extra: Record<string, string> = {}
  if (args.status !== undefined && args.status !== '') extra.status = args.status
  if (args.mspdStatus !== undefined && args.mspdStatus !== '') extra.mspd_status = args.mspdStatus
  const qs = buildListQuery({ extra })
  const res = await apiClientV2.get<{ status?: number; data?: CarStatistics; message?: string }>(
    `/cars/statistics${qs ? `?${qs}` : ''}`,
  )
  if (res.status === 0) throw new Error(res.message || 'Request failed')
  return res.data ?? {}
}

/** GET v2 /cars/export — joriy filtr, sahifalashsiz. */
export async function downloadCarsExport(filters: CarsFilters, format: 'csv' | 'xlsx') {
  const filterItems: FilterItem[] = []
  const name = filters.name?.trim()
  if (name) filterItems.push({ fieldKey: 'name', fieldOperator: 'LIKE', fieldValue: `%${name}%` })
  const number = filters.number?.trim()
  if (number) {
    filterItems.push({ fieldKey: 'number', fieldOperator: 'LIKE', fieldValue: `%${number}%` })
  }
  if (filters.status !== undefined && filters.status !== '') {
    filterItems.push({ fieldKey: 'status', fieldOperator: '=', fieldValue: filters.status })
  }
  if (filters.gaiStatus !== undefined && filters.gaiStatus !== '') {
    filterItems.push({ fieldKey: 'gai_status', fieldOperator: '=', fieldValue: filters.gaiStatus })
  }
  if (filters.mspdStatus !== undefined && filters.mspdStatus !== '') {
    filterItems.push({ fieldKey: 'mspd_status', fieldOperator: '=', fieldValue: filters.mspdStatus })
  }
  if (filters.organizationId) {
    filterItems.push({
      fieldKey: 'organization_id',
      fieldOperator: '=',
      fieldValue: filters.organizationId,
    })
  }
  if (filters.eduTypeId != null) {
    filterItems.push({ fieldKey: 'edu_type_id', fieldOperator: '=', fieldValue: filters.eduTypeId })
  }
  if (filters.mspdTypeId != null) {
    filterItems.push({ fieldKey: 'mspd_type_id', fieldOperator: '=', fieldValue: filters.mspdTypeId })
  }
  if (filters.mspdBodyTypeId != null) {
    filterItems.push({
      fieldKey: 'mspd_body_type_id',
      fieldOperator: '=',
      fieldValue: filters.mspdBodyTypeId,
    })
  }
  if (filters.educational === '0' || filters.educational === '1') {
    filterItems.push({
      fieldKey: 'educational',
      fieldOperator: '=',
      fieldValue: filters.educational,
    })
  }
  const qs = buildListQuery({
    filters: filterItems,
    sort: [{ fieldKey: 'id', fieldValue: 'DESC' }],
    extra: { format },
  })
  const token = getAccessToken()
  const response = await fetch(`${env.apiUrlV2}/cars/export?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Export failed')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `avtomobillar.${format}`
  link.click()
  URL.revokeObjectURL(url)
}

/** GET v2 /cars/re-check-mspd-car-info/:id */
export async function recheckCarMspd(carId: number) {
  const res = await apiClientV2.get<{
    status?: number | boolean
    message?: string
    response_code?: number
  }>(`/cars/re-check-mspd-car-info/${carId}`)
  assertOk(res)
  return res
}

/** GET v2 `/cars/enable-gai-status/:id` yoki `/cars/disable-gai-status/:id`. */
export async function setCarGaiStatus(carId: number, active: boolean) {
  const path = active ? `/cars/enable-gai-status/${carId}` : `/cars/disable-gai-status/${carId}`
  const res = await apiClientV2.get<{
    status?: number | boolean | string
    message?: string
  }>(path)
  assertOk(res)
  return res
}

/** POST v2 /cars/status-control/enable */
export async function enableCar(carId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/cars/status-control/enable', { car_id: carId })
  assertOk(res)
  return res
}

/** POST v2 /cars/status-control/disable */
export async function disableCar(carId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/cars/status-control/disable', { car_id: carId })
  assertOk(res)
  return res
}

/** POST v2 /cars/teacher-control/unmerge-teacher */
export async function unmergeTeacherFromCar(carId: number, teacherId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/cars/teacher-control/unmerge-teacher', {
    car_id: carId,
    teacher_id: teacherId,
  })
  assertOk(res)
  return res
}

/** POST v2 /cars/teacher-control/change-teacher */
export async function changeTeacherOnCar(carId: number, newTeacherId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/cars/teacher-control/change-teacher', {
    car_id: carId,
    new_teacher_id: newTeacherId,
  })
  assertOk(res)
  return res
}

/** POST v2 /cars/:id/select-category */
export async function changeCarCategory(carId: string, categoryId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/cars/${carId}/select-category`, { car_category_id: categoryId })
  assertOk(res)
  return res
}
