import { apiClientV2 } from './client'
import {
  assertOk,
  buildListQuery,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  ExpenseItem,
  ExpensePayload,
  ExpenseType,
  ExpenseTypePayload,
  MonthlyExpenseRow,
  RangeExpenseRow,
} from '@/types/expenses'

type Envelope = {
  status?: number | boolean
  message?: string
  data?: unknown
}

function asMonthMap(res: Envelope): Record<number, MonthlyExpenseRow[]> {
  let src: unknown = res.data
  if (src && typeof src === 'object' && !Array.isArray(src)) {
    const inner = src as { data?: unknown }
    if (inner.data && typeof inner.data === 'object' && !Array.isArray(inner.data)) {
      src = inner.data
    }
  }
  const rec = src && typeof src === 'object' && !Array.isArray(src)
    ? (src as Record<string, unknown>)
    : {}
  const out: Record<number, MonthlyExpenseRow[]> = {}
  for (let month = 1; month <= 12; month += 1) {
    const list = rec[String(month)] ?? rec[month]
    out[month] = Array.isArray(list) ? (list as MonthlyExpenseRow[]) : []
  }
  return out
}

/** GET v2 `/organization-expense` */
export async function fetchExpenses(args: {
  page: number
  showCount: number
  date?: string
  from?: string
  to?: string
}) {
  const filters: FilterItem[] = []
  if (args.date) {
    filters.push({ fieldKey: 'date', fieldOperator: '=', fieldValue: args.date })
  }
  if (args.from) {
    filters.push({ fieldKey: 'date', fieldOperator: '>=', fieldValue: args.from })
  }
  if (args.to) {
    filters.push({ fieldKey: 'date', fieldOperator: '<=', fieldValue: args.to })
  }
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
  })
  const res = await apiClientV2.get<Envelope>(`/organization-expense?${query}`)
  assertOk(res)
  return unwrapPage<ExpenseItem>(res, args.page, args.showCount)
}

/** GET v2 `/organization-expense-type` */
export async function fetchExpenseTypes(args: {
  page: number
  showCount: number
  search?: string
  withOrganization?: boolean
}) {
  const filters: FilterItem[] = []
  if (args.search?.trim()) {
    filters.push({
      fieldKey: 'name',
      fieldOperator: 'LIKE',
      fieldValue: args.search.trim(),
    })
  }
  const extra: Record<string, string> = {}
  if (args.withOrganization) extra['relations[0]'] = 'organization'
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
    extra,
  })
  const res = await apiClientV2.get<Envelope>(
    `/organization-expense-type?${query}`,
  )
  assertOk(res)
  return unwrapPage<ExpenseType>(res, args.page, args.showCount)
}

/** GET v2 `/organization-expense/monthly-expenses` */
export async function fetchMonthlyExpenses(year: string) {
  const query = year ? `?year=${encodeURIComponent(year)}` : ''
  const res = await apiClientV2.get<Envelope>(
    `/organization-expense/monthly-expenses${query}`,
  )
  assertOk(res)
  return asMonthMap(res)
}

/** GET v2 `/organization-expense/expenses-between-dates` */
export async function fetchExpensesBetweenDates(from?: string, to?: string) {
  const query = buildListQuery({
    extra: { start_date: from, end_date: to },
  })
  const res = await apiClientV2.get<Envelope>(
    `/organization-expense/expenses-between-dates${query ? `?${query}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<RangeExpenseRow>(res, 1, 200).data
}

export async function createExpense(payload: ExpensePayload) {
  const res = await apiClientV2.post<Envelope>('/organization-expense', payload)
  assertOk(res)
  return res
}

export async function updateExpense(id: number, payload: ExpensePayload) {
  const res = await apiClientV2.put<Envelope>(
    `/organization-expense/${id}`,
    payload,
  )
  assertOk(res)
  return res
}

export async function deleteExpense(id: number) {
  const res = await apiClientV2.delete<Envelope>(`/organization-expense/${id}`)
  assertOk(res)
  return res
}

export async function createExpenseType(payload: ExpenseTypePayload) {
  const res = await apiClientV2.post<Envelope>(
    '/organization-expense-type',
    payload,
  )
  assertOk(res)
  return res
}

export async function updateExpenseType(id: number, payload: ExpenseTypePayload) {
  const res = await apiClientV2.put<Envelope>(
    `/organization-expense-type/${id}`,
    payload,
  )
  assertOk(res)
  return res
}

export async function deleteExpenseType(id: number) {
  const res = await apiClientV2.delete<Envelope>(
    `/organization-expense-type/${id}`,
  )
  assertOk(res)
  return res
}
