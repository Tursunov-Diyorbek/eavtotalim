import { assertOk, buildListQuery, unwrapEntity, unwrapPage } from '@/lib/apiPage'
import { apiClientV2 } from './client'

export type MyGovApplicationItem = {
  id: number
  task_id?: string | number | null
  group_name?: string | null
  event_time?: string | null
  created_at?: string | null
  comment?: string | null
  status?: number | null
  organization?: { name?: string | null } | null
}

export type MyGovHistoryItem = {
  id: number
  created_at?: string | null
  status?: { name?: string | null; title?: string | null } | null
}

export type MyGovApplicationDetail = MyGovApplicationItem & {
  uztelecom_aes_event_histories?: MyGovHistoryItem[]
}

export type MyGovSimulatePayload = {
  edu_type_id: number
  group_name?: string
  start_date?: string
  end_date?: string
  theory_days?: string[]
  practical_days?: number
  theory_start_time?: string
  theory_end_time?: string
  practical_start_time?: string
  practical_end_time?: string
  students?: { pinfl: string; birthday?: string }[]
  teachers?: { pinfl: string; type_id: number }[]
  cars?: { number: string }[]
}

export type MyGovSimulateResult = {
  decision?: string
  decision_label?: string
  note?: string
  autodrome?: {
    required?: boolean
    available?: boolean
    is_vip?: boolean
  }
  errors?: Partial<Record<'organization' | 'students' | 'cars' | 'teachers', string[]>>
}

export async function fetchMyGovApplications(args: {
  page: number
  showCount: number
  taskId?: string
  groupName?: string
}) {
  const filters = []
  const taskId = args.taskId?.trim()
  const groupName = args.groupName?.trim()
  if (taskId) {
    filters.push({
      fieldKey: 'task_id',
      fieldOperator: 'LIKE',
      fieldValue: `%${taskId}%`,
    })
  }
  if (groupName) {
    filters.push({
      fieldKey: 'group_name',
      fieldOperator: 'LIKE',
      fieldValue: `%${groupName}%`,
    })
  }
  const qs = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/director-uztelecom-aes/index-applications${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<MyGovApplicationItem>(res, args.page, args.showCount)
}

export async function fetchMyGovApplication(id: number) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/director-uztelecom-aes/show-application/${id}`,
  )
  assertOk(res)
  return unwrapEntity<MyGovApplicationDetail>(res)
}

export async function resendMyGovAnswer(id: number, message: string) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    response_code?: number
  }>(`/super-admin/uztelecom-aes/send-manual-answer/${id}`, { message })
  assertOk(res)
  return res
}

export async function simulateMyGovApplication(payload: MyGovSimulatePayload) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: MyGovSimulateResult
  }>('/mygov/simulate/application', payload)
  assertOk(res)
  if (res.data && typeof res.data === 'object') return res.data
  return unwrapEntity<MyGovSimulateResult>(res)
}
