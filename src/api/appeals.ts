import { apiClientV2 } from './client'
import type {
  AppealDetail,
  AppealType,
  AppealsFilters,
  AppealsPage,
} from '@/types'

type FilterItem = {
  fieldKey: string
  fieldOperator: string
  fieldValue: string | number
}

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

function asPage<T>(payload: unknown): { data: T[]; total_items: number } {
  if (Array.isArray(payload)) {
    return { data: payload as T[], total_items: payload.length }
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      data?: unknown
      total_items?: number
      current_page?: number
      last_page?: number
    }
    const list = Array.isArray(obj.data) ? (obj.data as T[]) : []
    return {
      data: list,
      total_items: obj.total_items ?? list.length,
    }
  }
  return { data: [], total_items: 0 }
}

function buildFiltersQuery(filters: FilterItem[]): string {
  const sp = new URLSearchParams()
  filters.forEach((f, i) => {
    sp.set(`filters[${i}][fieldKey]`, f.fieldKey)
    sp.set(`filters[${i}][fieldOperator]`, f.fieldOperator)
    sp.set(`filters[${i}][fieldValue]`, String(f.fieldValue))
  })
  return sp.toString()
}

/** Murojaat turlari — GET /appeal-types/index */
export async function fetchAppealTypes(): Promise<AppealType[]> {
  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>('/appeal-types/index')

  if (res.status === 0) {
    throw new Error(res.message || 'Appeal types unavailable')
  }

  return asArray<AppealType>(res.data)
}

/** Murojaatlar ro‘yxati — GET /appeals/index */
export async function fetchAppeals(
  filters: AppealsFilters = {},
): Promise<AppealsPage> {
  const page = filters.page ?? 1
  const showCount = filters.showCount ?? 10
  const filterItems: FilterItem[] = []

  if (filters.appealTypeId != null && filters.appealTypeId !== '') {
    filterItems.push({
      fieldKey: 'appeal_type_id',
      fieldOperator: '=',
      fieldValue: filters.appealTypeId,
    })
  }
  if (filters.isClosed === 0 || filters.isClosed === 1) {
    filterItems.push({
      fieldKey: 'is_closed',
      fieldOperator: 'LIKE',
      fieldValue: filters.isClosed,
    })
  }
  if (filters.status) {
    filterItems.push({
      fieldKey: 'status',
      fieldOperator: 'LIKE',
      fieldValue: filters.status,
    })
  }

  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('show_count', String(showCount))
  const fq = buildFiltersQuery(filterItems)
  const query = fq ? `?${sp.toString()}&${fq}` : `?${sp.toString()}`

  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>(`/appeals/index${query}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Appeals unavailable')
  }

  const pageData = asPage<AppealsPage['data'][number]>(res.data)
  return {
    data: pageData.data,
    total_items: pageData.total_items,
  }
}

/** Bitta murojaat — GET /appeals/:id */
export async function fetchAppealById(
  id: number | string,
): Promise<AppealDetail | null> {
  const res = await apiClientV2.get<{
    status?: number
    data?: AppealDetail | { data?: AppealDetail }
    message?: string
  }>(`/appeals/${id}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Appeal unavailable')
  }

  const payload = res.data
  if (!payload) return null
  if (typeof payload === 'object' && 'id' in payload) {
    return payload as AppealDetail
  }
  if (
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data as AppealDetail
  }
  return null
}

export type StoreAppealInput = {
  appealTypeId: number | string
  message: string
  target: 'organization' | 'system'
  files?: File[]
}

/** Yangi murojaat — POST /appeals/store (multipart) */
export async function storeAppeal(input: StoreAppealInput): Promise<void> {
  const form = new FormData()
  form.append('appeal_type_id', String(input.appealTypeId))
  form.append('message', input.message.trim())
  form.append('target', input.target)
  for (const file of input.files ?? []) {
    form.append('files[]', file)
  }

  const res = await apiClientV2.postForm<{
    status?: number
    success?: boolean
    message?: string
  }>('/appeals/store', form)

  if (res.status === 0 && !res.success) {
    throw new Error(res.message || 'Appeal store failed')
  }
}

/** Murojaatni yopish — PUT /appeals/:id/close */
export async function closeAppeal(
  id: number | string,
  comment: string,
): Promise<void> {
  const trimmed = comment.trim()
  const path = `/appeals/${id}/close?comment=${encodeURIComponent(trimmed)}`
  const res = await apiClientV2.put<{
    status?: number
    message?: string
  }>(path, { comment: trimmed })

  if (res.status === 0) {
    throw new Error(res.message || 'Close failed')
  }
}
