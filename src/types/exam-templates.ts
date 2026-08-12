/** GET /student-exam-center-templates */

export type ExamTemplateResult = {
  max_result_percent?: number | string | null
  correct_answers_count?: number | null
}

export type ExamTemplateSaved = {
  updated_at?: string | null
}

export type ExamTemplateItem = {
  id: number
  name?: string | null
  saved_test?: ExamTemplateSaved | null | false
  exam_center_test_template_result?: ExamTemplateResult | null
}

/** location.state — eski CompleteTest bilan bir xil kalitlar */
export type ExamTemplateStartParams = {
  template_id: number
  lang_id: number
  /** 4 — javoblarni ko‘rib ketish, 5 — oxirida */
  isType: 4 | 5
  random: boolean
}

export type ExamContentBlock = {
  type?: number | string | null
  value?: string | null
  webp?: string | null
}

export type ExamAnswer = {
  id: number
  body?: ExamContentBlock[] | null
  /** 1 = to‘g‘ri */
  check?: number | null
  is_correct?: number | boolean | null
  question_id?: number | null
  newtest_question_id?: number | null
}

export type ExamQuestion = {
  id: number
  status?: number | null
  static_order_answers?: number | null
  comment?: string | null
  answer_description?: string | null
  answer_video?: string | null
  body?: ExamContentBlock[] | null
  question?: {
    body?: ExamContentBlock[] | null
  } | null
  answers?: ExamAnswer[] | null
}

export type ExamTemplateStartPayload = {
  questions: ExamQuestion[]
  exam_center_test_template?: { name?: string | null } | null
  saved_test?: unknown
}

export type ExamResultAttempt = {
  result?: number | null
  newTestQuestion?: {
    body?: ExamContentBlock[] | Record<string, ExamContentBlock> | null
  } | null
  answers?: Array<{
    id?: number
    body?: ExamContentBlock[] | Record<string, ExamContentBlock> | null
    check?: number | null
    student_answer?: number | boolean | null
  }> | null
  [key: string]: unknown
}

export type ExamTemplateCheckResult = {
  correct_answers_count?: number | null
  incorrect_answers_count?: number | null
  max_result_percent?: number | string | null
  percent?: number | string | null
  is_passed?: boolean | number | null
  last_attempt?: ExamResultAttempt[] | null
  [key: string]: unknown
}
