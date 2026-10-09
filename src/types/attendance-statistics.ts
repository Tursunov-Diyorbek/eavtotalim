export type DailyAttendanceGroup = {
  id?: number | string
  name?: string | null
  timetable?: number | string | null
  class_date_special_date?: {
    average_attendance?: number | string | null
  } | null
}

export type AbsenceGroupRow = {
  group?: {
    id?: number | string
    name?: string | null
    edu_type?: { short_name?: string | null } | null
  } | null
  class_date?: {
    is_monitored?: number | null
    average_attendance?: number | string | null
  } | null
  class_date_special_date?: unknown
}

export type AbsenceStudent = {
  id?: number | string
  user_id?: number | string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  passport?: {
    serial?: string | null
    seria?: string | null
    number?: string | null
    jshir?: string | null
  } | null
}

export type AbsenceStudentRow = {
  student?: AbsenceStudent | null
  group?: { id?: number | string; name?: string | null } | null
  class_date?: {
    is_monitored?: number | null
    average_attendance?: number | string | null
  } | null
  class_date_special_date?: unknown
}
