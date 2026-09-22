import { apiClientV2 } from './client'
import { normalizeExamQuestion } from './exam-templates'
import type {
  ExamQuestion,
  ExamTemplateCheckResult,
  ExamTemplateStartPayload,
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

/**
 * GET /exam-topic-test/start/:topicId/:langId
 * ?template_id=&lang_id=
 */
export async function startTopicTest(
  topicId: number,
  langId: number,
): Promise<ExamTemplateStartPayload> {
  const sp = new URLSearchParams()
  sp.set('template_id', String(topicId))
  sp.set('lang_id', String(langId))

  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>(`/exam-topic-test/start/${topicId}/${langId}?${sp.toString()}`)

  const ok = res.status === 1 || res.status === true
  const questions = extractQuestions(res.data ?? res)
  const name = extractTemplateName(res.data ?? res)
  const saved = extractSaved(res.data ?? res)

  if (!ok && questions.length === 0) {
    throw new Error(res.message || 'Failed to start topic test')
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

/** POST /exam-topic-test/check */
export async function checkTopicTest(payload: {
  topic_id: number
  lang_id: number
  selected_answers: Record<number, number[]>
}): Promise<ExamTemplateCheckResult> {
  const res = await apiClientV2.post<{
    status?: number | boolean
    data?: ExamTemplateCheckResult
    message?: string
  }>('/exam-topic-test/check', payload)

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
