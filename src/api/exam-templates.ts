import { apiClientV2 } from './client'
import { getAccessToken } from '@/lib/authStorage'
import type {
  ExamTemplateCheckResult,
  ExamTemplateItem,
  ExamTemplateStartPayload,
  ExamQuestion,
  ExamContentBlock,
  ExamAnswer,
} from '@/types'

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown; items?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    // Laravel ba’zan object ko‘rinishida qaytaradi
    const values = Object.values(obj)
    if (
      values.length > 0 &&
      values.every((v) => v && typeof v === 'object' && !Array.isArray(v))
    ) {
      return values as T[]
    }
  }
  return []
}

function asBodyList(
  body: ExamContentBlock[] | Record<string, ExamContentBlock> | null | undefined,
): ExamContentBlock[] {
  if (!body) return []
  if (Array.isArray(body)) return body
  if (typeof body === 'object') return Object.values(body)
  return []
}

function asAnswers(raw: unknown): ExamAnswer[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.values(raw)
      : []
  return list
    .filter((a): a is ExamAnswer => a != null && typeof a === 'object')
    .map((a) => {
      const id = Number((a as ExamAnswer).id)
      return {
        ...(a as ExamAnswer),
        id: Number.isFinite(id) ? id : (a as ExamAnswer).id,
      }
    })
    .filter((a) => Number.isFinite(Number(a.id)))
}

/** API savolini UI uchun bir xil shaklga keltirish (aralash test ham ishlatadi) */
export function normalizeExamQuestion(raw: unknown): ExamQuestion | null {
  if (!raw || typeof raw !== 'object') return null
  const q = raw as ExamQuestion & {
    question?: ExamQuestion & {
      body?: ExamContentBlock[] | Record<string, ExamContentBlock>
      answers?: ExamAnswer[] | Record<string, ExamAnswer>
    }
  }

  const nested = q.question
  const body = asBodyList(q.body ?? nested?.body ?? null)
  const answers = asAnswers(q.answers ?? nested?.answers ?? [])

  const id = Number(q.id ?? nested?.id)
  if (!Number.isFinite(id)) return null

  return {
    ...q,
    id,
    body,
    answers,
    question: nested
      ? {
          ...nested,
          body: asBodyList(nested.body),
          answers: asAnswers(nested.answers),
        }
      : q.question,
    answer_description:
      q.answer_description ?? nested?.answer_description ?? null,
    answer_video: q.answer_video ?? nested?.answer_video ?? null,
    comment: q.comment ?? nested?.comment ?? null,
  }
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

  // { questions: [...] }
  if (obj.questions != null) {
    const list = asList<unknown>(obj.questions)
    if (list.length) {
      return list
        .map(normalizeExamQuestion)
        .filter((q): q is ExamQuestion => q != null)
    }
  }

  // { exam_center_test_template: { questions } }
  if (obj.exam_center_test_template != null) {
    const nested = extractQuestions(obj.exam_center_test_template)
    if (nested.length) return nested
  }

  // { new_tests | tests | items }
  for (const key of ['new_tests', 'tests', 'items', 'exam_questions']) {
    if (obj[key] != null) {
      const list = asList<unknown>(obj[key])
      if (list.length) {
        return list
          .map(normalizeExamQuestion)
          .filter((q): q is ExamQuestion => q != null)
      }
    }
  }

  // { data: { questions } } yoki { data: [...] }
  if (obj.data != null) {
    const nested = extractQuestions(obj.data)
    if (nested.length) return nested
  }

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

/** Shablon testlar — GET /student-exam-center-templates */
export async function fetchExamTemplates(): Promise<ExamTemplateItem[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    response_code?: number
    data?: unknown
    message?: string
  }>('/student-exam-center-templates')

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Exam templates unavailable')
  }

  const payload = res.data
  if (Array.isArray(payload)) return payload as ExamTemplateItem[]
  if (payload && typeof payload === 'object') {
    const nested = payload as { data?: unknown }
    if (Array.isArray(nested.data)) return nested.data as ExamTemplateItem[]
    return asList<ExamTemplateItem>(payload)
  }
  return []
}

/**
 * Testni boshlash — eski front bilan bir xil:
 * GET /student-exam-center-test-template-start/:id/:lang
 * ?token&template_id&lang_id&relations[0]&relations[1]
 */
export async function startExamTemplate(
  templateId: number,
  langId: number,
): Promise<ExamTemplateStartPayload> {
  const token = getAccessToken() ?? ''
  const sp = new URLSearchParams()
  sp.set('token', token)
  sp.set('template_id', String(templateId))
  sp.set('lang_id', String(langId))
  // axios default: relations[]=... (eski front bilan bir xil)
  sp.append('relations[]', 'exam_center_test_template')
  sp.append('relations[]', 'saved_test')
  // ba’zi backendlar indexed format kutadi
  sp.set('relations[0]', 'exam_center_test_template')
  sp.set('relations[1]', 'saved_test')

  const res = await apiClientV2.get<{
    status?: number | boolean
    response_code?: number
    success?: boolean
    data?: unknown
    message?: string
  }>(
    `/student-exam-center-test-template-start/${templateId}/${langId}?${sp.toString()}`,
  )

  const ok =
    res.status === 1 ||
    res.status === true ||
    res.response_code === 200 ||
    res.success === true

  // Ba’zi javoblarda status bo‘lmasada data keladi
  const questions = extractQuestions(res.data ?? res)
  const name = extractTemplateName(res.data ?? res)
  const saved = extractSaved(res.data ?? res)

  if (!ok && questions.length === 0) {
    throw new Error(res.message || 'Failed to start exam template')
  }

  if (questions.length === 0) {
    throw new Error(res.message || 'Savollar topilmadi')
  }

  return {
    questions,
    exam_center_test_template: name
      ? { name }
      : ((res.data as ExamTemplateStartPayload | undefined)
          ?.exam_center_test_template ?? null),
    saved_test: saved,
  }
}

/** Tekshirish — POST /student-exam-center-test-template-check */
export async function checkExamTemplate(payload: {
  template_id: number
  selected_answers: Record<number, number[]>
}): Promise<ExamTemplateCheckResult> {
  const res = await apiClientV2.post<{
    status?: number | boolean
    data?: ExamTemplateCheckResult
    message?: string
  }>('/student-exam-center-test-template-check', payload)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Check failed')
  }

  // Natija ba’zan to‘g‘ridan data, ba’zan nested
  const data = res.data
  if (data && typeof data === 'object' && 'last_attempt' in data) {
    return data
  }
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: ExamTemplateCheckResult }).data ?? {}
  }
  return (data as ExamTemplateCheckResult) ?? {}
}

/** Saqlash — POST /student-exam-center-save-test/:id */
export async function saveExamTemplate(templateId: number): Promise<void> {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/student-exam-center-save-test/${templateId}`)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Save failed')
  }
}
