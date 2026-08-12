import type { ExamTemplateResult } from './exam-templates'

/** GET /student-exam-center-saved-test */

export type SavedExamTemplateItem = {
  id: number
  /** Boshlash uchun shablon id */
  test_id?: number | null
  exam_center_test_template?: {
    id?: number
    name?: string | null
    exam_center_test_template_result?: ExamTemplateResult | null
  } | null
  updated_at?: string | null
  created_at?: string | null
}
