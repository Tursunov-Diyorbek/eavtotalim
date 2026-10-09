import { HttpError, apiClient, apiClientV2, withAccessToken } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  TeacherCreateOptions,
  TeacherDetail,
  TeacherItem,
  TeachersFilters,
} from '@/types/teachers'

/** GET v2 /teachers */
export async function fetchTeachers(filters: TeachersFilters) {
  const filterItems: FilterItem[] = []
  const push = (fieldKey: string, fieldValue?: string) => {
    const value = fieldValue?.trim()
    if (!value) return
    filterItems.push({
      fieldKey,
      fieldOperator: fieldKey === 'status' || fieldKey === 'mspd_status' ? '=' : 'LIKE',
      fieldValue: value,
    })
  }

  push('last_name', filters.lastName)
  push('first_name', filters.firstName)
  push('middle_name', filters.middleName)
  push('passport_seria', filters.passportSeria)
  push('passport_number', filters.passportNumber)
  push('passport_jshir', filters.passportJshir)
  // Eski NewTeachers: tab "all" bo‘lmasa type_id LIKE (1 nazariy, 2 amaliy, 3 tibbiyot).
  // Sort yuborilmaydi — status DESC birinchi sahifani boshqa tartibda qaytaradi.
  if (filters.typeId && filters.typeId !== 'all') {
    filterItems.push({
      fieldKey: 'type_id',
      fieldOperator: 'LIKE',
      fieldValue: Number(filters.typeId),
    })
  }
  if (filters.mspdStatus !== undefined && filters.mspdStatus !== '') {
    filterItems.push({
      fieldKey: 'mspd_status',
      fieldOperator: '=',
      fieldValue: filters.mspdStatus,
    })
  }

  // Holat tanlovi: 1 Faol, 2 guruhsiz, 0 Faol emas. Barchasi — status yuborilmaydi.
  const status = filters.status?.trim()
  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: filterItems,
    extra: status != null && status !== '' ? { status } : undefined,
    sort: filters.sortKey
      ? [{ fieldKey: filters.sortKey, fieldValue: filters.sortOrder ?? 'DESC' }]
      : undefined,
  })

  const res = await apiClientV2.get<Record<string, unknown>>(`/teachers?${query}`)
  assertOk(res)
  return unwrapPage<TeacherItem>(res, filters.page, filters.showCount)
}

/** GET v2 /teachers/:id */
export async function fetchTeacher(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/teachers/${id}`)
  assertOk(res)
  return unwrapEntity<TeacherDetail>(res)
}

/** GET v2 /teachers/edit/:id */
export async function fetchTeacherEdit(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/teachers/edit/${id}`)
  assertOk(res)
  return unwrapEntity<TeacherDetail>(res)
}

/** POST v1 /teacher-create — select optionlari */
export async function fetchTeacherCreateOptions(): Promise<TeacherCreateOptions> {
  const res = await apiClient.post<Record<string, unknown>>(
    withAccessToken('/teacher-create'),
  )
  const data = unwrapEntity<TeacherCreateOptions>(res)
  return {
    citizenships: asNamedList(data.citizenships),
    edu_types: asNamedList(data.edu_types),
    education_degrees: asNamedList(data.education_degrees),
    teacher_types: asNamedList(data.teacher_types),
    license_category: asNamedList(data.license_category),
  }
}

function assertTeacherSaved(res: { status?: number | boolean; message?: string }) {
  if (res.status === 2 || res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Validation error')
  }
}

/** POST v2 /teachers (FormData) */
export async function createTeacher(formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>('/teachers', formData)
  assertTeacherSaved(res)
  return res
}

type TeacherActionBody = {
  status?: number | boolean
  message?: string
  errors?: unknown
}

/** `errors.other_errors` yoki birinchi matn. `message` ko‘pincha "Validation failed". */
export function teacherActionError(source: unknown, fallback = 'Request failed'): string {
  const body =
    source instanceof HttpError && source.payload && typeof source.payload === 'object'
      ? (source.payload as TeacherActionBody)
      : (source as TeacherActionBody | null)
  const errors = body?.errors
  if (errors && typeof errors === 'object') {
    for (const val of Object.values(errors as Record<string, unknown>)) {
      if (typeof val === 'string' && val.trim()) return val.trim()
      if (Array.isArray(val)) {
        const text = val.find((item) => typeof item === 'string' && item.trim())
        if (typeof text === 'string') return text.trim()
      }
    }
  }
  if (source instanceof HttpError && source.message.trim()) return source.message.trim()
  if (source instanceof Error && source.message.trim()) return source.message.trim()
  return body?.message?.trim() || fallback
}

/** POST v2 /teachers/status-control/enable|disable/:id */
export async function setTeacherActive(id: string, active: boolean) {
  const action = active ? 'enable' : 'disable'
  const res = await apiClientV2.post<TeacherActionBody>(
    `/teachers/status-control/${action}/${id}`,
  )
  if (res.status === 0 || res.status === false) {
    throw new Error(teacherActionError(res))
  }
  return res
}

/** POST v2 /teachers/:id (FormData) */
export async function updateTeacher(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/teachers/${id}`, formData)
  assertTeacherSaved(res)
  return res
}
