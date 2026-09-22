import { apiClient, apiClientV2, withAccessToken } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapPage,
} from '@/lib/apiPage'
import type {
  CreatePaymentHistoryPayload,
  GroupReportRow,
  OrgReportRow,
  PaymentCheckItem,
  PaymentCreatePageData,
  PaymentGroupOption,
  PaymentHistoryPageData,
  StudentForPayment,
  StudentPaymentListRow,
  YearReportPageData,
  YearReportPayType,
} from '@/types/payment-history'

type Envelope = {
  status?: number | boolean
  ok?: number
  message?: string
  data?: unknown
  pay_type?: unknown
}

function asRec(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** GET v2 `/get-payment-history` */
export async function fetchPaymentHistory(args: {
  page: number
  fio?: string
  search?: string
  payTypeId?: number | null
  fromDate?: string
  toDate?: string
}): Promise<PaymentHistoryPageData> {
  const extra: Record<string, string | number> = { page: args.page }
  if (args.fio?.trim()) extra.fio = args.fio.trim()
  if (args.search) extra.search = args.search
  if (args.payTypeId != null) extra.pay_type_id = args.payTypeId
  if (args.fromDate) extra.from_date = args.fromDate
  if (args.toDate) extra.to_date = args.toDate
  const query = buildListQuery({ extra })
  const res = await apiClientV2.get<Envelope>(`/get-payment-history?${query}`)
  if (res.ok === 0 || res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Request failed')
  }
  const inner = asRec(res.data)
  const payments = inner.payments ?? inner
  const rec = asRec(payments)
  const list = Array.isArray(payments)
    ? payments
    : Array.isArray(rec.data)
      ? rec.data
      : []
  const total = Number(rec.total ?? rec.total_items ?? list.length) || list.length
  return {
    data: list as PaymentHistoryPageData['data'],
    total_items: total,
    last_page: Math.max(1, Math.ceil(total / 15) || 1),
  }
}

/** POST v2 `/create-payment-history` */
export async function createPaymentHistory(payload: CreatePaymentHistoryPayload) {
  const res = await apiClientV2.post<Envelope>('/create-payment-history', payload)
  if (res.ok === 0 || res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Payment failed')
  }
  return res
}

/** GET v2 `/groups` — o‘quvchilari bilan (modal). */
export async function fetchPaymentGroups(): Promise<PaymentGroupOption[]> {
  const query = buildListQuery({ page: 1, show_count: 500 })
  const res = await apiClientV2.get<Envelope>(`/groups?${query}`)
  assertOk(res)
  return unwrapPage<PaymentGroupOption>(res, 1, 500).data
}

/** GET v2 `/groups/select` — eski Header to‘lov modal. */
export async function fetchGroupsSelect(): Promise<PaymentGroupOption[]> {
  const res = await apiClientV2.get<Envelope>('/groups/select')
  assertOk(res)
  const list = asNamedList<PaymentGroupOption>(res.data ?? res)
  return list.map((item) => ({
    id: Number(item.id),
    name: item.name ?? item.name_uz ?? null,
    name_uz: item.name_uz ?? item.name ?? null,
    edu_status: item.edu_status,
    education_price: item.education_price,
  }))
}

/** GET v2 `/school-payment/show/:id` */
export async function fetchPaymentCheck(id: string): Promise<PaymentCheckItem | null> {
  const res = await apiClientV2.get<Envelope>(`/school-payment/show/${id}`)
  const inner = asRec(res.data)
  if (inner.id) return inner as unknown as PaymentCheckItem
  const deeper = asRec(inner.data)
  return deeper.id ? (deeper as unknown as PaymentCheckItem) : null
}

/** GET v1 `/get-report-groups` */
export async function fetchOrgPaymentReport(page: number, showCount: number) {
  const query = buildListQuery({
    extra: { show_count: showCount, page },
  })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/get-report-groups?${query}`),
  )
  assertOk(res)
  const pageData = unwrapPage<OrgReportRow>(res, page, showCount)
  return pageData
}

/** GET v1 `/get-general-groups-report` */
export async function fetchGroupPaymentReport(args: {
  page: number
  showCount: number
  search?: string
}) {
  const extra: Record<string, string | number> = {
    show_count: args.showCount,
    page: args.page,
  }
  if (args.search?.trim()) extra.word = args.search.trim()
  const query = buildListQuery({ extra })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/get-general-groups-report?${query}`),
  )
  assertOk(res)
  return unwrapPage<GroupReportRow>(res, args.page, args.showCount)
}

/** GET v1 `/payments-index` */
export async function fetchStudentPaymentsIndex(args: {
  page: number
  showCount: number
  search?: string
}) {
  const extra: Record<string, string | number> = {
    show_count: args.showCount,
    page: args.page,
  }
  if (args.search?.trim()) extra.word = args.search.trim()
  const query = buildListQuery({ extra })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/payments-index?${query}`),
  )
  assertOk(res)
  return unwrapPage<StudentPaymentListRow>(res, args.page, args.showCount)
}

/** GET v1 `/year-report/index` */
export async function fetchYearPaymentReport(args: {
  page: number
  showCount: number
  search?: string
  startDate: string
  endDate: string
}): Promise<YearReportPageData> {
  const extra: Record<string, string | number> = {
    show_count: args.showCount,
    page: args.page,
    start_date: args.startDate,
    end_date: args.endDate,
  }
  if (args.search?.trim()) extra.word = args.search.trim()
  const query = buildListQuery({ extra })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/year-report/index?${query}`),
  )
  assertOk(res)
  const pageData = unwrapPage<YearReportPageData['data'][number]>(
    res,
    args.page,
    args.showCount,
  )
  return {
    ...pageData,
    payTypes: asNamedList<YearReportPayType>(res.pay_type),
  }
}

/** GET v1 `/payment-create` */
export async function fetchPaymentCreateList(args: {
  page: number
  showCount: number
  search?: string
  groupId?: string
  year?: string
}): Promise<PaymentCreatePageData> {
  const extra: Record<string, string | number> = {
    show_count: args.showCount,
    page: args.page,
    group_id: args.groupId || 'all',
    edu_year: args.year || 'all',
  }
  if (args.search?.trim()) extra.word = args.search.trim()
  const query = buildListQuery({ extra })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/payment-create?${query}`),
  )
  assertOk(res)
  const body = asRec(res)
  const students = unwrapPage<PaymentCreatePageData['students'][number]>(
    { data: body.students },
    args.page,
    args.showCount,
  )
  const groupsRaw = body.all_groups
  const yearsRaw = body.years
  return {
    students: students.data,
    total_items: students.total_items,
    last_page: students.last_page,
    groups: Array.isArray(groupsRaw)
      ? (groupsRaw as PaymentCreatePageData['groups'])
      : [],
    years: Array.isArray(yearsRaw) ? (yearsRaw as Array<string | number>) : [],
  }
}

/** GET v1 `/get-student-for-payment` */
export async function fetchStudentForPayment(studentId: string): Promise<StudentForPayment> {
  const query = buildListQuery({ extra: { student_id: studentId } })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/get-student-for-payment?${query}`),
  )
  assertOk(res)
  const data = asRec(res.data)
  return {
    ...(data as StudentForPayment),
    pay_type: asNamedList<YearReportPayType>(res.pay_type ?? data.pay_type),
  }
}

/** POST v1 `/payment-store` */
export async function storeStudentPayment(payload: {
  studentId: number
  amount: string
  payTypeId: number
  paymentDate?: string
}) {
  const form = new FormData()
  form.append('student_id', String(payload.studentId))
  form.append('amount', payload.amount)
  form.append('pay_type_id', String(payload.payTypeId))
  if (payload.paymentDate) form.append('payment_date', payload.paymentDate)
  const res = await apiClient.postForm<Envelope>(
    withAccessToken('/payment-store'),
    form,
  )
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

/** POST v1 `/payment-delete` */
export async function deleteStudentPayment(paymentId: number) {
  const form = new FormData()
  form.append('payment_id', String(paymentId))
  const res = await apiClient.postForm<Envelope>(
    withAccessToken('/payment-delete'),
    form,
  )
  assertOk(res)
  return res
}
