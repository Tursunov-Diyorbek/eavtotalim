export type MonitoringStudentRow = {
  student_id?: number | null
  id?: number | null
  student_fullname?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  remaining_lessons?: number | string | null
  group?: {
    id?: number | null
    name?: string | null
    name_uz?: string | null
    name_kiril?: string | null
    name_ru?: string | null
  } | null
}

export type MonitoringAbsenceRow = {
  id?: number | null
  date?: string | null
  topic?: {
    name?:
      | string
      | { uz?: string | null; kiril?: string | null; ru?: string | null }
      | null
    name_uz?: string | null
    name_kiril?: string | null
    name_ru?: string | null
    name_en?: string | null
    name_qq?: string | null
  } | null
}
