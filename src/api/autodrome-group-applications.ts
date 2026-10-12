import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type { GroupApplicationRow } from '@/types/autodrome-group-application'

type Envelope = {
  response_code?: number
  status?: number | boolean
  message?: string
  data?: unknown
}

function assertApplicationOk(res: Envelope) {
  if (res.response_code === 403) {
    const extra = typeof res.data === 'string' ? res.data : res.message
    throw new Error(extra || 'Forbidden')
  }
  if (res.response_code != null && res.response_code !== 200) {
    throw new Error(res.message || 'Request failed')
  }
  assertOk(res)
}

export type GroupApplicationFilters = {
  page: number
  showCount: number
  organization?: string
  inn?: string
  taskId?: string
  group?: string
  eduTypeId?: string
  status?: string
}

const RELATIONS = [
  'organization',
  'uztelecom_aes_event_group.event_students',
  'uztelecom_aes_event',
  'uztelecom_aes_event_group.edu_type',
]

/** GET v2 `/autodrome-organization-group-applications/index` */
export async function fetchGroupApplications(filters: GroupApplicationFilters) {
  const items: FilterItem[] = []
  const like = (fieldKey: string, value?: string) => {
    const text = value?.trim()
    if (!text) return
    items.push({ fieldKey, fieldOperator: 'LIKE', fieldValue: text })
  }
  like('organization.name_uz', filters.organization)
  like('organization.inn', filters.inn)
  like('uztelecom_aes_event.task_id', filters.taskId)
  like('uztelecom_aes_event_group.group_name', filters.group)
  if (filters.eduTypeId) {
    items.push({
      fieldKey: 'uztelecom_aes_event_group.edu_type_id',
      fieldOperator: '=',
      fieldValue: filters.eduTypeId,
    })
  }
  if (filters.status) {
    items.push({ fieldKey: 'status', fieldOperator: '=', fieldValue: filters.status })
  }
  const extra: Record<string, string> = {}
  RELATIONS.forEach((name, index) => {
    extra[`relations[${index}]`] = name
  })
  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
    extra,
  })
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-organization-group-applications/index?${query}`,
  )
  assertApplicationOk(res)
  return unwrapPage<GroupApplicationRow>(res, filters.page, filters.showCount)
}

/** POST v2 `/autodrome-organization-group-applications/accept/:id` */
export async function acceptGroupApplication(id: number) {
  const res = await apiClientV2.post<Envelope>(
    `/autodrome-organization-group-applications/accept/${id}`,
  )
  assertApplicationOk(res)
  return res
}

/** POST v2 `/autodrome-organization-group-applications/reject/:id` */
export async function rejectGroupApplication(id: number) {
  const res = await apiClientV2.post<Envelope>(
    `/autodrome-organization-group-applications/reject/${id}`,
  )
  assertApplicationOk(res)
  return res
}
