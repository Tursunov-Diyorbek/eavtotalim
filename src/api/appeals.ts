import { apiClientV2 } from './client'
import { asNamedList, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type {
  AppealDetail,
  AppealStatus,
  AppealType,
  AppealsFilters,
  AppealsPage,
} from '@/types'

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

  return asNamedList<AppealType>(res.data)
}

/** Murojaatlar ro‘yxati — GET /appeals/index */
export async function fetchAppeals(
  filters: AppealsFilters = {},
): Promise<AppealsPage> {
  const page = filters.page ?? 1
  const showCount = filters.showCount ?? 10
  const filterItems: FilterItem[] = []

  const likeName = (fieldKey: string, value?: string | null) => {
    const text = value?.trim()
    if (!text) return
    filterItems.push({
      fieldKey,
      fieldOperator: 'LIKE',
      fieldValue: `%${text}%`,
    })
  }
  likeName('student.last_name', filters.lastName)
  likeName('student.first_name', filters.firstName)
  likeName('student.middle_name', filters.middleName)

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

  const query = buildListQuery({
    page,
    show_count: showCount,
    filters: filterItems,
  })

  const res = await apiClientV2.get<{
    status?: number
    data?: unknown
    message?: string
  }>(`/appeals/index?${query}`)

  if (res.status === 0) {
    throw new Error(res.message || 'Appeals unavailable')
  }

  return unwrapPage<AppealsPage['data'][number]>(res.data, page, showCount)
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

export type UpdateAppealStatusInput = {
  id: number | string
  status: AppealStatus
  comment: string
}

/** Murojaat holati — PUT /appeals/:id/status */
export async function updateAppealStatus(
  input: UpdateAppealStatusInput,
): Promise<void> {
  const res = await apiClientV2.put<{
    status?: number
    message?: string
  }>(`/appeals/${input.id}/status`, {
    status: input.status,
    comment: input.comment.trim(),
  })

  if (res.status === 0) {
    throw new Error(res.message || 'Status update failed')
  }
}
