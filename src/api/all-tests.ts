import { apiClientV2 } from './client'
import { normalizeExamQuestion } from './exam-templates'
import type {
  AllTestQuestion,
  AllTestsPage,
  AllTestsQueryParams,
  ExamContentBlock,
} from '@/types'

function asBodyList(
  body: ExamContentBlock[] | Record<string, ExamContentBlock> | null | undefined,
): ExamContentBlock[] {
  if (!body) return []
  if (Array.isArray(body)) return body
  return Object.values(body)
}

function normalizeAllQuestion(raw: unknown): AllTestQuestion | null {
  const q = normalizeExamQuestion(raw)
  if (!q) return null
  const src = raw as AllTestQuestion & {
    answer_video?: string | null
    question?: { answer_video?: string | null }
  }
  return {
    id: q.id,
    body: asBodyList(q.body ?? q.question?.body ?? null),
    answers: q.answers ?? [],
    answer_description: q.answer_description ?? null,
    answer_video:
      src.answer_video ?? src.question?.answer_video ?? q.answer_video ?? null,
  }
}

function asPage(payload: unknown): AllTestsPage {
  if (Array.isArray(payload)) {
    const data = payload
      .map(normalizeAllQuestion)
      .filter((q): q is AllTestQuestion => q != null)
    return { data, total_items: data.length }
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      data?: unknown
      total_items?: number
      current_page?: number
      last_page?: number
    }
    const list = Array.isArray(obj.data) ? obj.data : []
    const data = list
      .map(normalizeAllQuestion)
      .filter((q): q is AllTestQuestion => q != null)
    return {
      data,
      total_items: obj.total_items ?? data.length,
      current_page: obj.current_page,
      last_page: obj.last_page,
    }
  }
  return { data: [], total_items: 0 }
}

/**
 * GET /get-all-questions-by-language/:langId
 * ?page&show_count&filters[0][fieldKey]=body&filters[0][fieldOperator]=LIKE&...
 */
export async function fetchAllQuestionsByLanguage(
  params: AllTestsQueryParams,
): Promise<AllTestsPage> {
  const page = Math.max(1, params.page ?? 1)
  const showCount = Math.max(1, params.showCount ?? 10)
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('show_count', String(showCount))

  const search = params.search?.trim()
  if (search) {
    sp.set('filters[0][fieldKey]', 'body')
    sp.set('filters[0][fieldOperator]', 'LIKE')
    sp.set('filters[0][fieldValue]', search)
  }

  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>(`/get-all-questions-by-language/${params.langId}?${sp.toString()}`)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Questions unavailable')
  }

  return asPage(res.data)
}

/** UI til → API lang id (eski front bilan bir xil) */
export function allTestsLangId(lang: string): number {
  if (lang === 'ru') return 2
  if (lang === 'kiril' || lang === 'kr') return 3
  return 1
}
