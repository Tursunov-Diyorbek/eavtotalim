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
  group?: { name?: string | null } | null
  passport?: { seria?: string | null; number?: string | null } | null
  template_test_student_report?: TemplateTestReport | null
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
}
