/** GET /organization-student-final-exam/index */

export type FinalExamAttempt = {
  correct_answers_count?: number | null
  incorrect_answers_count?: number | null
  questions_count?: number | null
  start_time?: string | null
  end_time?: string | null
  history?: string | null
}

export type FinalExamStudentResult = {
  result?: number | null
  attempt?: FinalExamAttempt | null
}

export type FinalExamInfo = {
  name?: string | null
  start_time?: string | null
  end_time?: string | null
  status?: number | null
}

export type FinalExamIndexData = {
  exam?: FinalExamInfo | null
  organization_final_exam_student_result?: FinalExamStudentResult | null
  message?: string | null
}

export type FinalExamHistoryItem = {
  result?: number | null
  [key: string]: unknown
}

export type FinalExamStartParams = {
  face: string
  lang_id: number
}

export type FinalExamQuestionItem = {
  question?: {
    id?: number
    body?: unknown
    answers?: unknown
    static_order_answers?: number | null
  } | null
  status?: number | null
  [key: string]: unknown
}

export type FinalExamFaceResult = {
  status_checking?: number | null
  answer_checking?: number | null
  answer_message?: string | null
  message?: string | null
  result_checking?: {
    best_match?: { probability_percent?: number | string | null }
  } | null
}

export type FinalExamStartResult = {
  history?: FinalExamQuestionItem[] | null
  face_result?: FinalExamFaceResult | null
}
