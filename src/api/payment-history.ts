import { apiClient, apiClientV2, withAccessToken } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapPage,
} from '@/lib/apiPage'
import type {
  CreatePaymentHistoryPayload,
  GeneralReport,
  GeneralReportCard,
  GeneralReportMonth,
  GroupShareRow,
  PaymentShare,
  OrgReportRow,
  PaymentCheckItem,
  PaymentCreatePageData,
  PaymentGroupOption,
  PaymentHistoryPageData,
  SetAccountingBonusPayload,
  StoreAccountingPaymentPayload,
  StudentForPayment,
  StudentPaymentDetail,
  StudentPaymentFilters,
  StudentPaymentHistoryItem,
  StudentPaymentListRow,
  StudentPaymentStatus,
  YearReportPayType,
  YearlyReportRow,
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

function asNum(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function asList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map(asRec)
  const rec = asRec(value)
  if (Array.isArray(rec.data)) return rec.data.map(asRec)
  if (Array.isArray(rec.items)) return rec.items.map(asRec)
  return []
}

function asCard(value: unknown): GeneralReportCard {
  const item = asRec(value)
  const g = item.is_grow
  return {
    amount: asNum(item.amount ?? item.total ?? item.value),
    label: String(item.label ?? item.title ?? ''),
    subtitle: String(item.sub_label ?? item.subtitle ?? item.description ?? ''),
    grow: g === true || g === 1 || g === '1' ? true : g === false || g === 0 || g === '0' ? false : null,
  }
}

function isFutureMonth(year: number, month: number) {
  const now = new Date()
  if (year < now.getFullYear()) return false
  if (year > now.getFullYear()) return true
  return month > now.getMonth() + 1
}

/** GET v2 `/accounting-general-reports/index?year=` — eski `OrganizationReports` («Tashkilot umumiy hisoboti»). */
export async function fetchAccountingGeneralReport(year: number): Promise<GeneralReport> {
  const res = await apiClientV2.get<Envelope>(`/accounting-general-reports/index?year=${year}`)
  assertOk(res)
  const root = asRec(res.data)
  const cards = asRec(root.cards)
  const reportYear = asNum(root.year) || year
  const month = asNum(root.month) || new Date().getMonth() + 1
  const tableRows = asList(root.monthly_table)
  const chartRows = asList(root.dynamics_chart)

  const months: GeneralReportMonth[] = Array.from({ length: 12 }, (_, index) => {
    const m = index + 1
    const row = tableRows.find((item) => asNum(item.month) === m) ?? tableRows[index] ?? {}
    const chart = chartRows.find((item) => asNum(item.month) === m) ?? chartRows[index] ?? {}
    const cash = asNum(row.cash)
    const card = asNum(row.card)
    const bank = asNum(row.bank)
    const income = asNum(row.total_income) || asNum(chart.income)
    const expense = asNum(row.total_expense) || asNum(chart.expense)
    const profit = asNum(row.net_profit) || income - expense
    const hasValue = Boolean(cash || card || bank || income || expense)
    return {
      month: m,
      name: typeof row.month_name === 'string' ? row.month_name : '',
      cash,
      card,
      bank,
      income,
      expense,
      profit,
      empty: !hasValue && isFutureMonth(reportYear, m),
    }
  })

  return {
    year: reportYear,
    month,
    monthName: typeof root.month_name === 'string' ? root.month_name : '',
    income: asCard(cards.total_income),
    expense: asCard(cards.total_expense),
    profit: asCard(cards.net_profit),
    yearProfit: asCard(cards.yearly_net_profit),
    months,
  }
}

function pick(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    let current: unknown = source
    for (const part of key.split('.')) current = asRec(current)[part]
    if (current !== undefined && current !== null && current !== '') return current
  }
  return undefined
}

function asShare(
  row: Record<string, unknown>,
  key: string,
  countKeys: string[],
  percentKeys: string[],
): PaymentShare {
  const block = asRec(row[key])
  const distribution = asRec(row.distribution)
  const count = asNum(block.count ?? pick(row, countKeys))
  const percent = asNum(
    block.percent ?? distribution[`${key}_percent`] ?? pick(row, percentKeys),
  )
  return {
    count,
    percent,
    label: typeof block.label === 'string' && block.label ? block.label : `${count} (${percent}%)`,
  }
}

function toGroupShareRow(value: unknown): GroupShareRow {
  const row = asRec(value)
  const group = row.group
  const nested = asRec(group)
  const studentsRaw = pick(row, ['students_count', 'total_students', 'students_total', 'students'])
  return {
    id: asNum(row.id ?? row.group_id ?? nested.id),
    name: String(
      row.group_name ||
        row.name ||
        row.name_uz ||
        row.name_kiril ||
        row.name_ru ||
        (typeof group === 'string' ? group : '') ||
        nested.name ||
        nested.name_uz ||
        '—',
    ),
    students: Array.isArray(studentsRaw) ? studentsRaw.length : asNum(studentsRaw),
    paid: asShare(
      row,
      'fully_paid',
      ['fully_paid_count', 'paid_100_count', 'full_paid_count', 'paid_count'],
      ['fully_paid_percent', 'paid_100_percent', 'paid_percent'],
    ),
    partial: asShare(
      row,
      'partially_paid',
      ['partially_paid_count', 'partial_count', 'partial_paid_count', 'partial.count'],
      ['partially_paid_percent', 'partial_percent', 'partial_paid_percent', 'partial.percent'],
    ),
    unpaid: asShare(
      row,
      'unpaid',
      ['unpaid_count', 'not_paid_count', 'zero_paid_count', 'unpaid.count'],
      ['unpaid_percent', 'not_paid_percent'],
    ),
  }
}

/** GET v2 `/accounting-group-reports/index` — eski `GroupReports` («Guruh hisoboti»). */
export async function fetchAccountingGroupReport(args: {
  page: number
  showCount: number
  search?: string
}) {
  const params = new URLSearchParams({
    page: String(args.page),
    show_count: String(args.showCount),
  })
  if (args.search?.trim()) params.set('group_search', args.search.trim())
  const res = await apiClientV2.get<Envelope>(`/accounting-group-reports/index?${params}`)
  assertOk(res)
  const pageData = unwrapPage<unknown>(res, args.page, args.showCount)
  return { ...pageData, data: pageData.data.map(toGroupShareRow) }
}

/** Eksport uchun barcha sahifalar (100 tadan, ko‘pi bilan 50 sahifa). */
export async function fetchAllAccountingGroupReport(search?: string) {
  const all: GroupShareRow[] = []
  for (let page = 1; page <= 50; page += 1) {
    const res = await fetchAccountingGroupReport({ page, showCount: 100, search })
    all.push(...res.data)
    if (res.data.length < 100 || page >= res.last_page) break
  }
  return all
}

/** GET v1 `/payments-index` */
function asStatus(value: unknown): { status: StudentPaymentStatus; text: string } {
  const raw = asRec(value)
  const label =
    value && typeof value === 'object' ? String(raw.name ?? raw.label ?? '') : String(value ?? '')
  const key = label.toLowerCase()
  if (key.includes('qisman') || key.includes('partial') || key === '2')
    return { status: 'partial', text: '' }
  if (key.includes("to'lamagan") || key.includes('tolamagan') || key.includes('unpaid') || key === '4')
    return { status: 'unpaid', text: '' }
  if (key.includes('qarz') || key.includes('debt') || key === '3') return { status: 'debt', text: '' }
  if (key.includes("to'langan") || key.includes('tolangan') || key.includes('paid') || key === '1')
    return { status: 'paid', text: '' }
  return { status: '', text: label }
}

function toStudentPaymentRow(value: unknown, index: number): StudentPaymentListRow {
  const row = asRec(value)
  const student = asRec(row.student)
  const group = row.group
  const fio = (source: Record<string, unknown>) =>
    [source.last_name, source.first_name, source.middle_name].filter(Boolean).join(' ')
  const studentId = asNum(row.student_id ?? student.id ?? row.id)
  const { status, text } = asStatus(
    row.status_label ?? row.payment_status ?? row.status ?? row.holat,
  )
  return {
    key: `${studentId}-${index}`,
    studentId,
    name: String(
      row.student_name || student.student_name || row.fio || student.fio || fio(student) || fio(row) || '—',
    ),
    group: String(
      row.group_name ||
        asRec(group).name ||
        asRec(group).name_uz ||
        (typeof group === 'string' ? group : '') ||
        '—',
    ),
    totalPrice: asNum(row.total_course_price),
    debt: asNum(row.debt),
    paid: asNum(row.total_paid ?? row.paid_amount ?? row.summa),
    bonus: asNum(row.bonus ?? row.bonus_amount),
    bonusNote: String(
      row.bonus_description ||
        row.bonus_comment ||
        asRec(row.summary).bonus_description ||
        student.bonus_description ||
        '',
    ),
    date: typeof row.last_payment_date === 'string' ? row.last_payment_date : '',
    status,
    statusText: text,
  }
}

/** GET v2 `/accounting-payments/index` — eski `PaymentStudents` («O‘quvchilar to‘lovlari»). */
export async function fetchStudentPaymentsIndex(args: StudentPaymentFilters) {
  const params = new URLSearchParams({
    page: String(args.page),
    show_count: String(args.showCount),
  })
  if (args.search?.trim()) params.set('student_search', args.search.trim())
  if (args.groupId) params.set('group_id', args.groupId)
  if (args.status) params.set('payment_status', args.status)
  if (args.startDate) params.set('start_date', args.startDate)
  if (args.endDate) params.set('end_date', args.endDate)
  const res = await apiClientV2.get<Envelope>(`/accounting-payments/index?${params}`)
  assertOk(res)
  const pageData = unwrapPage<unknown>(res, args.page, args.showCount)
  return { ...pageData, data: pageData.data.map(toStudentPaymentRow) }
}

function asText(value: unknown) {
  if (value == null || value === '') return ''
  if (typeof value === 'object') {
    const rec = asRec(value)
    return String(rec.name ?? rec.code ?? rec.label ?? '')
  }
  return String(value)
}

function toHistoryItem(value: unknown, index: number): StudentPaymentHistoryItem {
  const record = asRec(value)
  const nested = asRec(record.payment)
  const payment = Object.keys(nested).length ? nested : record
  const org = asRec(payment.organization)
  const group = asRec(payment.group)
  const cashier = asRec(payment.created_by_user ?? payment.user)
  const id = asNum(payment.id ?? record.id)
  return {
    key: `${id}-${index}`,
    id,
    date: String(record.date || record.payment_date || payment.payment_date || ''),
    createdAt: String(record.created_at || payment.created_at || ''),
    amount: asNum(record.amount ?? payment.amount),
    payType: asText(record.pay_type ?? payment.pay_type) || '—',
    createdBy: String(
      record.created_by ||
        cashier.name ||
        record.cashier ||
        asRec(record.user).name ||
        record.who ||
        '—',
    ),
    org: String(org.name_uz || org.name || ''),
    group: String(group.name_uz || group.short_name_uz || group.name || ''),
  }
}

/** GET v2 `/accounting-payments/show/:id` — eski `unwrapPaymentShow`. */
export async function fetchAccountingPaymentShow(studentId: number): Promise<StudentPaymentDetail> {
  const res = await apiClientV2.get<Envelope>(`/accounting-payments/show/${studentId}`)
  assertOk(res)
  const root = asRec(res.data)
  const student = asRec(root.student)
  const summary = asRec(root.summary)
  const rawHistory = [root.payment_history, root.payments, root.history].find(Array.isArray) ?? []
  const history = (rawHistory as unknown[]).map(toHistoryItem)

  const totalPrice = asNum(
    summary.total_course_price ?? root.total_course_price ?? summary.total_price ?? root.total_price,
  )
  const debt = asNum(summary.current_debt ?? summary.debt ?? root.current_debt ?? root.debt)
  const historyPaid = history.reduce((sum, item) => sum + item.amount, 0)
  let paid = asNum(summary.total_paid ?? summary.paid ?? root.total_paid ?? root.paid)
  if (!paid && historyPaid) paid = historyPaid
  if (!paid && totalPrice && debt >= 0) paid = Math.max(totalPrice - debt, 0)
  let percent = asNum(summary.paid_percent ?? root.paid_percent)
  if (!percent && totalPrice) percent = Math.round((paid / totalPrice) * 100)
  percent = Math.min(Math.max(percent, 0), 100)

  const row = toStudentPaymentRow(root, 0)
  const studentRow = toStudentPaymentRow(student, 0)
  const payTypes = (Array.isArray(root.pay_types) ? root.pay_types : []).map((item) => {
    const rec = asRec(item)
    return { id: asNum(rec.id), name: String(rec.name ?? rec.label ?? rec.id ?? '') }
  })

  return {
    name: row.name !== '—' ? row.name : studentRow.name,
    groupName: row.group !== '—' ? row.group : studentRow.group,
    eduType:
      asText(student.edu_type) || asText(root.edu_type) || asText(root.edu_category) || '—',
    totalPrice,
    paid,
    debt,
    bonus: asNum(summary.bonus ?? root.bonus),
    bonusDescription: String(
      summary.bonus_description || root.bonus_description || root.bonus_comment || '',
    ),
    percent,
    percentLabel:
      typeof summary.paid_percent_label === 'string' &&
      summary.paid_percent_label &&
      paid === asNum(summary.total_paid)
        ? summary.paid_percent_label
        : '',
    history,
    payTypes,
  }
}

/** POST v2 `/accounting-payments/store` */
export async function storeAccountingPayment(payload: StoreAccountingPaymentPayload) {
  const res = await apiClientV2.post<Envelope>('/accounting-payments/store', payload)
  assertOk(res)
  return res
}

/** POST v2 `/accounting-payments/set-bonus` */
export async function setAccountingPaymentBonus(payload: SetAccountingBonusPayload) {
  const res = await apiClientV2.post<Envelope>('/accounting-payments/set-bonus', payload)
  assertOk(res)
  return res
}

/** GET v2 `/accounting-payments/filter-groups` */
export async function fetchStudentPaymentGroups() {
  const res = await apiClientV2.get<Envelope>('/accounting-payments/filter-groups')
  assertOk(res)
  const root = res.data
  const list = Array.isArray(root) ? root : asList(root).length ? asList(root) : asList(asRec(root).groups)
  return list.map((item) => {
    const rec = asRec(item)
    return {
      id: asNum(rec.id),
      name: String(rec.name || rec.name_uz || rec.group_name || rec.id || ''),
    }
  })
}

function toYearlyRow(value: unknown, index: number): YearlyReportRow {
  const row = asRec(value)
  return {
    id: asNum(row.id ?? row.group_id) || index + 1,
    group: String(row.group_name || '—'),
    students: asNum(row.students_count),
    price: asNum(row.education_price),
    payable: asNum(row.total_expected),
    paid: asNum(row.total_paid),
    uzcard: asNum(row.uzcard_amount),
    humo: asNum(row.humo_amount),
    cash: asNum(row.cash_amount),
    bank: asNum(row.bank_amount),
    returned: asNum(row.returned_amount),
    debt: asNum(row.debt),
    teacher: String(row.teacher_name || '—'),
  }
}

/** GET v2 `/accounting-yearly-reports/index?year=` — eski `YearReportIndex` («Yillik hisobot»). */
export async function fetchAccountingYearlyReport(year: number) {
  const res = await apiClientV2.get<Envelope>(`/accounting-yearly-reports/index?year=${year}`)
  assertOk(res)
  const root = asRec(res.data)
  const groups = root.groups
  const source = groups && typeof groups === 'object' && !Array.isArray(groups) ? groups : root
  const rec = asRec(source)
  const list = Array.isArray(source)
    ? source
    : Array.isArray(rec.data)
      ? rec.data
      : Array.isArray(rec.groups)
        ? rec.groups
        : Array.isArray(rec.items)
          ? rec.items
          : Array.isArray(rec.table)
            ? rec.table
            : []
  return {
    year: asNum(root.year) || year,
    rows: list.map(toYearlyRow),
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
