export type InfoExamStatusOption = {
  id?: string | number | null
  name?: unknown
}

export type InfoExamResultRow = {
  id: number
  name?: string | null
  group?: unknown
  start_time?: string | null
  end_time?: string | null
  status?: string | number | null
}

export type InfoExamStudentResult = {
  id?: number | string
  percent?: number | string | null
  correct_answers_count?: number | string | null
  question_count?: number | string | null
  student?: {
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
}
