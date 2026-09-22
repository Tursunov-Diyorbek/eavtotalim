import { getAccessToken } from '@/lib/authStorage'
import { assertOk, buildListQuery, unwrapPage } from '@/lib/apiPage'
import { apiClientV2 } from './client'

export type MessageScheduleItem = {
  id: number
  name?: string | null
  body?: string | null
  students_count?: number | null
  status?: number | null
  message_schedule_status?: { id?: number; name?: string | null } | null
}

export type MessageTemplateItem = {
  id: number
  name?: string | null
  body?: string | null
}

export type MessageStudentItem = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  phone1?: string | null
  /** Ba’zi endpointlar `phone` qaytaradi */
  phone?: string | null
  debt?: number | string | null
  birthday?: string | null
}

/** Ro‘yxatdagi telefon maydoni (phone1 yoki phone). */
export function studentPhoneOf(
  row: Pick<MessageStudentItem, 'phone1' | 'phone'> | null | undefined,
): string {
  const raw = row?.phone1 || row?.phone
  return raw != null && String(raw).trim() !== '' ? String(raw).trim() : ''
}

export type MessageScheduleStudentItem = {
  id: number
  body?: string | null
  phone?: string | null
  status?: number | null
  message_schedule_student_status?: { id?: number; name?: string | null } | null
}

export type SendMode = 'group' | 'activeDebtors' | 'endedDebtors' | 'birthday'

/** Eski API kabi queryda token — ba’zi middleware shuni kutadi. */
function withTokenExtra(
  extra?: Record<string, string | number | boolean | null | undefined>,
) {
  return {
    ...extra,
    token: getAccessToken() ?? '',
  }
}

export async function fetchMessageSchedules(page: number, showCount: number) {
  const qs = buildListQuery({
    page,
    show_count: showCount,
    extra: withTokenExtra(),
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/message-schedule${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<MessageScheduleItem>(res, page, showCount)
}

export async function fetchMessageScheduleStudents(
  id: number,
  page: number,
  showCount: number,
) {
  const qs = buildListQuery({
    page,
    show_count: showCount,
    extra: withTokenExtra(),
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/message-schedule/${id}${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<MessageScheduleStudentItem>(res, page, showCount)
}

export async function fetchMessageTemplates(page: number, showCount: number | 'all') {
  const qs = buildListQuery({
    page,
    extra: withTokenExtra({ show_count: showCount }),
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/message-schedule/templates${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  const count = showCount === 'all' ? 1000 : showCount
  return unwrapPage<MessageTemplateItem>(res, page, count)
}

export async function createMessageTemplate(payload: { name: string; body: string }) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/message-schedule/templates', payload)
  assertOk(res)
  return res
}

export async function updateMessageTemplate(
  id: number,
  payload: { name: string; body: string },
) {
  const res = await apiClientV2.put<{
    status?: number | boolean
    message?: string
  }>(`/message-schedule/templates/${id}`, payload)
  assertOk(res)
  return res
}

export async function deleteMessageTemplate(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/message-schedule/templates/${id}`)
  assertOk(res)
  return res
}

export async function fetchNotificationStudents(args: {
  mode: SendMode
  groupId?: number
  page: number
  showCount: number
}) {
  const extra: Record<string, string | number> = {}
  let path = '/message-schedule/students/birthday'
  if (args.mode === 'group') {
    path = '/message-schedule/students/by-group'
    if (args.groupId) extra.group_id = args.groupId
  } else if (args.mode === 'activeDebtors') {
    path = '/message-schedule/students/active-group-debtors'
    if (args.groupId) extra.group_id = args.groupId
  } else if (args.mode === 'endedDebtors') {
    path = '/message-schedule/students/ended-group-debtors'
    if (args.groupId) extra.group_id = args.groupId
  }
  const qs = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra: withTokenExtra(extra),
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `${path}${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<MessageStudentItem>(res, args.page, args.showCount)
}

export async function sendScheduledMessage(payload: {
  students: number[]
  name: string
  message_schedule_template_id: number
}) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: unknown
  }>('/message-schedule', payload)
  assertOk(res)
  return res
}
