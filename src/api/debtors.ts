import { apiClient, apiClientV2, withAccessToken } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapPage,
  type ApiPage,
} from '@/lib/apiPage'
import type { DebtorFilterGroup, DebtorRow } from '@/types/debtors'

type Envelope = {
  status?: number | boolean
  ok?: number
  message?: string
  data?: unknown
}

/** GET v2 `/school-payment/debtors-v2` */
export async function fetchDebtors(args: {
  page: number
  showCount: number
  fio?: string
  groupId?: string
}): Promise<ApiPage<DebtorRow>> {
  const extra: Record<string, string | number> = {}
  if (args.fio?.trim()) extra.fio = args.fio.trim()
  if (args.groupId) extra.group_id = args.groupId
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra,
  })
  const res = await apiClientV2.get<Envelope>(`/school-payment/debtors-v2?${query}`)
  if (res.ok === 0) throw new Error(res.message || 'Request failed')
  assertOk(res)
  return unwrapPage<DebtorRow>(res, args.page, args.showCount)
}

/** GET v1 `/group-optimal?for_filter=true` */
export async function fetchDebtorFilterGroups(): Promise<DebtorFilterGroup[]> {
  const res = await apiClient.get<Envelope>(
    withAccessToken('/group-optimal?for_filter=true'),
  )
  assertOk(res)
  return asNamedList<DebtorFilterGroup>(res.data)
}
