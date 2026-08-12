import { apiClientV2 } from './client'
import type { SavedExamTemplateItem } from '@/types'

function asList(payload: unknown): SavedExamTemplateItem[] {
  if (Array.isArray(payload)) return payload as SavedExamTemplateItem[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { data?: unknown; items?: unknown }
    if (Array.isArray(obj.data)) return obj.data as SavedExamTemplateItem[]
    if (Array.isArray(obj.items)) return obj.items as SavedExamTemplateItem[]
    const values = Object.values(obj)
    if (
      values.length > 0 &&
      values.every((v) => v && typeof v === 'object' && !Array.isArray(v))
    ) {
      return values as SavedExamTemplateItem[]
    }
  }
  return []
}

/** GET /student-exam-center-saved-test */
export async function fetchSavedExamTemplates(): Promise<SavedExamTemplateItem[]> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: unknown
    message?: string
  }>('/student-exam-center-saved-test')

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Saved tests unavailable')
  }

  return asList(res.data)
}

/** DELETE /saved-test/:savedTestId — saqlangan yozuvni olib tashlash */
export async function deleteSavedTest(savedTestId: number): Promise<void> {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/saved-test/${savedTestId}`)

  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Delete failed')
  }
}
