import { apiClientV2, HttpError } from './client'
import { getAccessToken } from '@/lib/authStorage'
import type {
  FinalExamIndexData,
  FinalExamQuestionItem,
  FinalExamStartResult,
} from '@/types'

function asIndexData(payload: unknown): FinalExamIndexData {
  if (!payload || typeof payload !== 'object') return {}
  return payload as FinalExamIndexData
}

/** GET /organization-student-final-exam/index */
export async function fetchFinalExamIndex(): Promise<{
  data: FinalExamIndexData
  message?: string
}> {
  const res = await apiClientV2.get<{
    response_code?: number
    status?: number | boolean
    data?: unknown
    message?: string
  }>('/organization-student-final-exam/index')

  const ok =
    res.response_code === 200 ||
    res.status === 1 ||
    res.status === true

  if (!ok && !res.data) {
    throw new Error(res.message || 'Final exam unavailable')
  }

  return {
    data: asIndexData(res.data),
    message: res.message,
  }
}

/** POST /organization-student-final-exam/start */
export async function startFinalExam(payload: {
  face: string
  lang_id: number
}): Promise<FinalExamStartResult> {
  const token = getAccessToken() ?? ''
  try {
    const res = await apiClientV2.post<{
      response_code?: number
      status?: number | boolean
      data?: FinalExamStartResult
      message?: string
    }>(
      `/organization-student-final-exam/start?token=${encodeURIComponent(token)}`,
      payload,
    )

    const data = res.data ?? {}
    return data
  } catch (e) {
    if (e instanceof HttpError) {
      const body = e.payload as {
        message?: string
        errors?: Record<string, string[]>
        data?: FinalExamStartResult
      }
      const fromErrors = body?.errors
        ? Object.values(body.errors).flat().join('\n')
        : null
      throw new Error(fromErrors || body?.message || e.message)
    }
    throw e
  }
}

/** POST /organization-student-final-exam/answer */
export async function submitFinalExamAnswers(
  answers: Array<{ question_id: number; answer_id: number }>,
): Promise<unknown> {
  const token = getAccessToken() ?? ''
  const res = await apiClientV2.post<{
    response_code?: number
    status?: number | boolean
    data?: unknown
    message?: string
    ok?: number
    error?: string
  }>(
    `/organization-student-final-exam/answer?token=${encodeURIComponent(token)}`,
    { answers },
  )

  if (res.ok === 0) {
    throw new Error(res.error || res.message || 'Submit failed')
  }
  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Submit failed')
  }
  return res.data ?? res
}

export function parseFinalExamHistory(
  history: string | null | undefined,
): Array<{ result?: number }> {
  if (!history) return []
  try {
    const parsed = JSON.parse(history) as unknown
    return Array.isArray(parsed) ? (parsed as Array<{ result?: number }>) : []
  } catch {
    return []
  }
}

export function asFinalExamQuestions(
  history: FinalExamQuestionItem[] | null | undefined,
): FinalExamQuestionItem[] {
  return Array.isArray(history) ? history : []
}
