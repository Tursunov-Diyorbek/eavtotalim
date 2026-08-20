import { apiClient, withAccessToken } from './client'
import { assertOk, unwrapPage, type ApiPage } from '@/lib/apiPage'
import type {
  InfoExamResultRow,
  InfoExamStatusOption,
  InfoExamStudentResult,
} from '@/types/info-exam-results'

export class InfoExamAgreementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InfoExamAgreementError'
  }
}

function assertExamOk(res: {
  status?: number | boolean | string
  message?: string
}) {
  if (String(res.status) === '4') {
    throw new InfoExamAgreementError(res.message || '')
  }
  assertOk(res)
}

function asStatuses(payload: unknown): InfoExamStatusOption[] {
  const body = (payload ?? {}) as Record<string, unknown>
  const filters = body.filters
  if (filters && typeof filters === 'object') {
    const list = (filters as { statuses?: unknown }).statuses
    if (Array.isArray(list)) return list as InfoExamStatusOption[]
  }
  const nested = body.data
  if (nested && typeof nested === 'object') {
    const inner = nested as { filters?: { statuses?: unknown } }
    if (Array.isArray(inner.filters?.statuses)) {
      return inner.filters.statuses as InfoExamStatusOption[]
    }
  }
  return []
}

export type InfoExamResultsList = ApiPage<InfoExamResultRow> & {
  statuses: InfoExamStatusOption[]
}

/** GET v1 `/info-exam-results` — token query da. */
export async function fetchInfoExamResults(args: {
  page: number
  showCount: number
  word: string
  status: string
}): Promise<InfoExamResultsList> {
  const sp = new URLSearchParams()
  sp.set('page', String(args.page))
  sp.set('show_count', String(args.showCount))
  sp.set('status', args.status || 'all')
  const word = args.word.trim()
  if (word) sp.set('word', word)
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/info-exam-results?${sp}`),
  )
  assertExamOk(res)
  const page = unwrapPage<InfoExamResultRow>(res, args.page, args.showCount)
  return { ...page, statuses: asStatuses(res) }
}

function asResults(payload: unknown): InfoExamStudentResult[] {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  if (Array.isArray(nested)) return nested as InfoExamStudentResult[]
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>
    if (Array.isArray(inner.real_results)) {
      return inner.real_results as InfoExamStudentResult[]
    }
    if (Array.isArray(inner.data)) return inner.data as InfoExamStudentResult[]
  }
  return []
}

/** GET v1 `/info-exam-results-show?exam_id=` */
export async function fetchInfoExamResultShow(examId: string) {
  const sp = new URLSearchParams()
  sp.set('exam_id', examId)
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/info-exam-results-show?${sp}`),
  )
  assertExamOk(res)
  return asResults(res)
}
