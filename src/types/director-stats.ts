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
