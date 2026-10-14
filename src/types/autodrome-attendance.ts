export type AutodromeGroupRow = {
  id: number
  name?: string | null
  group_students_count?: number | string | null
  autodrome_students_count?: number | string | null
  attended_students_count?: number | string | null
  created_at?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  start_time?: string | null
  end_time?: string | null
  week_days?: string | number[] | null
  edu_status?: number | string | null
  edu_type?: { short_name?: string | null; name?: string | null } | null
  autodrome?: { inn?: string | null; name?: string | null } | null
  organization?: { inn?: string | null; name?: string | null } | null
}

export type AutodromeAttendanceEvent = {
  type?: string | null
  timestamp?: string | null
}

export type AutodromeDayAttendance = {
  first_entry?: string | null
  last_exit?: string | null
  current_image?: string | null
  events?: AutodromeAttendanceEvent[] | null
}

export type AutodromeAttendanceStudent = {
  id: number
  full_name?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  attendances?: Record<string, AutodromeDayAttendance | null> | null
}

/** `GET v2 /autodrome-organization-students/list` — kameraga ulangan o‘quvchi. */
export type AutodromeOrganizationStudent = {
  id: number
  image?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  full_name?: string | null
  passport?: string | null
  group?: { id?: number | null; name?: string | null } | null
  organization?: { inn?: string | null; name?: string | null } | null
  autodrome?: { inn?: string | null; name?: string | null } | null
}

export type AutodromeAttendancePage = {
  data: AutodromeAttendanceStudent[]
  dates: string[]
  total: number
}

/** GAI «Avtodrom davomati» — `GET v2 /autodrome-student-attendances/report`. */
export type AutodromeResGaiRow = {
  id?: number
  required_attendance_count?: number | string | null
  required_attendance_hours?: number | string | null
  total_attendance_count?: number | string | null
  total_attendance_hours?: number | string | null
  organization?: { id?: number | null; inn?: string | null; name?: string | null } | null
  student?: { id?: number | null; full_name?: string | null } | null
  group?: {
    id?: number | null
    name?: string | null
    status?: number | string | null
    edu_starting_date?: string | null
    edu_ending_date?: string | null
  } | null
}
