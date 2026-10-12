export type TemplateTestReport = {
  updated_at?: string | null
  templates_count_done?: number | null
  average_corrects?: number | string | null
  corrects_count?: number | null
}

export type TemplateStatRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  group?: { id?: number | null; name?: string | null } | null
  group_id?: number | null
  passport?: { seria?: string | null; number?: string | null } | null
  template_test_student_report?: TemplateTestReport | null
}

export type RandomTestResult = {
  updated_at?: string | null
  question_count?: number | string | null
  correct_answers_count?: number | string | null
  incorrect_answers_count?: number | string | null
  percent?: number | string | null
}

export type TopicTestAnalyse = {
  last_attempt_date?: string | null
  total_questions?: number | string | null
  total_incorrects?: number | string | null
  total_attempts?: number | string | null
  best_result?: {
    corrects?: number | string | null
    percent?: number | string | null
  } | null
}

export type TopicStatRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  group?: { id?: number | null; name?: string | null } | null
  passport?: { seria?: string | null; number?: string | null } | null
  exam_topic_test_student_analyse?: TopicTestAnalyse | null
}

export type TopicTestResultRow = {
  id?: number
  topic?: {
    name?:
      | string
      | { uz?: string | null; kiril?: string | null; ru?: string | null }
      | null
    name_uz?: string | null
    name_ru?: string | null
    name_kiril?: string | null
  } | null
  question_count?: number | string | null
  correct_answers_count?: number | string | null
  incorrect_answers_count?: number | string | null
  max_result_corrects?: number | string | null
  percent?: number | string | null
  max_result_percent?: number | string | null
}

export type FinalExamAttempt = {
  id?: number | null
  end_time?: string | null
  questions_count?: number | string | null
  correct_answers_count?: number | string | null
  incorrect_answers_count?: number | string | null
}

export type ExamStatRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  group?: { id?: number | null; name?: string | null } | null
  passport?: { seria?: string | null; number?: string | null } | null
  final_exam_student_result?: { last_attempt?: FinalExamAttempt | null } | null
}

export type ExamReviewBlock = {
  type?: number | null
  value?: string | null
  webp?: string | null
}

export type ExamReviewAnswer = {
  id?: number | null
  check?: boolean | number | null
  body?: ExamReviewBlock[] | null
}

export type ExamReviewQuestion = {
  question_body?: ExamReviewBlock[] | null
  answers?: ExamReviewAnswer[] | null
  selected_answer_id?: number | null
}

export type RandomStatRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  group?: { id?: number | null; name?: string | null } | null
  passport?: { seria?: string | null; number?: string | null } | null
  random_test_results?: RandomTestResult[] | null
}

export type TemplateTestResultRow = {
  id?: number
  template_id?: number | null
  template?: {
    name?:
      | string
      | number
      | { uz?: string | null; kiril?: string | null; ru?: string | null }
      | null
    name_uz?: string | null
  } | null
  correct_answers_count?: number | string | null
  incorrect_answers_count?: number | string | null
  percent?: number | string | null
}

export type ContentGroupRow = {
  id: number
  name?: string | null
  edu_type?: { short_name?: string | null } | null
  students_count?: number | null
  group_topic_action_report?: number | string | null
}

export type ContentStudentRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  topic_action_report?: number | string | null
  student_topic_action_report?: {
    learned_topics_count?: number | null
  } | null
}

export type ContentStudentTopicRow = {
  id?: number
  topic?: {
    name?: { uz?: string | null; kiril?: string | null; ru?: string | null } | string | null
    name_uz?: string | null
  } | null
  topic_action_limit?: { time_limit?: number | null } | null
  student_topic_action?: { reading_time?: number | null } | null
}
