import { apiClientV2 } from './client'
import {
  normalizeExamQuestion,
} from './exam-templates'
import type {
  ExamQuestion,
  ExamTemplateCheckResult,
  ExamTemplateStartPayload,
  RandomTestLatestResult,
} from '@/types'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown; items?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

function extractQuestions(payload: unknown): ExamQuestion[] {
  if (!payload) return []
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeExamQuestion)
      .filter((q): q is ExamQuestion => q != null)
  }
  if (typeof payload !== 'object') return []
  const obj = payload as Record<string, unknown>
  if (obj.questions != null) {
    const list = asList<unknown>(obj.questions)
    if (list.length) {
      return list
        .map(normalizeExamQuestion)
        .filter((q): q is ExamQuestion => q != null)
    }
  }
  if (obj.data != null) return extractQuestions(obj.data)
  return []
}

function extractTemplateName(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const obj = payload as Record<string, unknown>
  const tpl = obj.exam_center_test_template as
    | { name?: string | null }
    | undefined
  if (tpl?.name) return String(tpl.name)
  if (obj.data && typeof obj.data === 'object') {
    return extractTemplateName(obj.data)
  }
  return ''
}

function extractSaved(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as Record<string, unknown>
  if ('saved_test' in obj) return obj.saved_test
  if (obj.data && typeof obj.data === 'object') {
    return extractSaved(obj.data)
  }
  return null
}

/** GET /random-test/latest-result */
export async function fetchRandomTestLatestResult(): Promise<RandomTestLatestResult | null> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: RandomTestLatestResult | null
    message?: string
  }>('/random-test/latest-result')

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Latest result unavailable')
  }

  const data = res.data
  if (!data || typeof data !== 'object') return null
  if ('correct_answers_count' in data || 'percent' in data || 'question_count' in data) {
    return data as RandomTestLatestResult
  }
  return null
}

/**
 * GET /random-test/start/lang/:langId?limit=20|50|100
 */
export async function startRandomTest(
  langId: number,
  questionCount: number,
): Promise<ExamTemplateStartPayload> {
  const sp = new URLSearchParams()
  sp.set('lang_id', String(langId))
  sp.set('limit', String(questionCount))

  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>(`/random-test/start/lang/${langId}?${sp.toString()}`)

  const ok = res.status === 1 || res.status === true
  const questions = extractQuestions(res.data ?? res)
  const name = extractTemplateName(res.data ?? res)
  const saved = extractSaved(res.data ?? res)

  if (!ok && questions.length === 0) {
    throw new Error(res.message || 'Failed to start random test')
  }
  if (questions.length === 0) {
    throw new Error(res.message || 'Savollar topilmadi')
  }

  return {
    questions,
    exam_center_test_template: name ? { name } : null,
    saved_test: saved,
  }
}

/** POST /random-test/check-test */
export async function checkRandomTest(payload: {
  selected_answers: Record<number, number[]>
}): Promise<ExamTemplateCheckResult> {
  const res = await apiClientV2.post<{
    status?: number | boolean
    data?: ExamTemplateCheckResult
    message?: string
  }>('/random-test/check-test', payload)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Check failed')
  }

  const data = res.data
  if (data && typeof data === 'object' && 'last_attempt' in data) {
    return data
  }
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: ExamTemplateCheckResult }).data ?? {}
  }
  return (data as ExamTemplateCheckResult) ?? {}
}
