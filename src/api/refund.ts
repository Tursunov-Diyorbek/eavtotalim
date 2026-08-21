import { apiClient, withAccessToken } from './client'
import {
  assertOk,
  asNamedList,
  buildListQuery,
  unwrapPage,
  type ApiPage,
} from '@/lib/apiPage'
import type {
  RefundGroupOption,
  RefundRow,
  RefundStudentOption,
} from '@/types/refund'

type Envelope = {
  status?: number | boolean
  message?: string
  data?: unknown
  filters?: { groups?: RefundGroupOption[] }
  validator_errors?: unknown
}

export type RefundListResult = ApiPage<RefundRow> & {
  groups: RefundGroupOption[]
}

export class RefundValidationError extends Error {
  fields: Record<string, string>
  constructor(fields: Record<string, string>, message?: string) {
    super(message || Object.values(fields)[0] || 'Validation error')
    this.name = 'RefundValidationError'
    this.fields = fields
  }
}

export function isRefundValidationError(
  err: unknown,
): err is RefundValidationError {
  return err instanceof RefundValidationError
}

function flattenValidator(errors: unknown): Record<string, string> {
  if (!errors || typeof errors !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const msg = Array.isArray(value)
      ? String(value[0] ?? '')
      : typeof value === 'string'
        ? value
        : ''
    if (msg) out[key] = msg
  }
  return out
}

function isFailStatus(status: Envelope['status']) {
  return status == 0 || status === false
}

function isValidationStatus(status: Envelope['status']) {
  return status == 2
}

/** GET v1 `/returned-payments-index` */
export async function fetchReturnedPayments(args: {
  page: number
  showCount: number
  word?: string
  groupId?: string
}): Promise<RefundListResult> {
  const extra: Record<string, string | number> = {}
  if (args.word?.trim()) extra.word = args.word.trim()
  if (args.groupId) extra.group_id = args.groupId
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra,
  })
  const res = await apiClient.get<Envelope>(
    withAccessToken(`/returned-payments-index?${query}`),
  )
  assertOk(res)
  const page = unwrapPage<RefundRow>(res, args.page, args.showCount)
  return {
    ...page,
    groups: asNamedList<RefundGroupOption>(res.filters?.groups),
  }
}

/** GET v1 `/return-payment-get-students-by-group` */
export async function fetchRefundStudentsByGroup(
  groupId: string,
): Promise<RefundStudentOption[]> {
  const res = await apiClient.get<Envelope>(
    withAccessToken(
      `/return-payment-get-students-by-group?group_id=${encodeURIComponent(groupId)}`,
    ),
  )
  assertOk(res)
  return asNamedList<RefundStudentOption>(res.data)
}

/** POST v1 `/return-payment-store` (FormData) */
export async function storeReturnedPayment(payload: {
  studentId: string
  amount: string
  description: string
  returnedDate: string
}) {
  const form = new FormData()
  form.append('student_id', payload.studentId)
  form.append('amount', payload.amount)
  form.append('description', payload.description)
  form.append('returned_date', payload.returnedDate)
  const res = await apiClient.postForm<Envelope>(
    withAccessToken('/return-payment-store'),
    form,
  )
  if (isValidationStatus(res.status)) {
    throw new RefundValidationError(
      flattenValidator(res.validator_errors),
      res.message,
    )
  }
  if (isFailStatus(res.status)) {
    throw new Error(res.message || 'Request failed')
  }
  assertOk(res)
  return res
}
