/** GET v2 /monitoring-camera/index-daily-attendance */

export type DailyArrival = {
  id?: number | string
  student_id?: number | string | null
  fio?: string | null
  full_name?: string | null
  student_fullname?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  group_id?: number | string | null
  group_name?: string | null
  organization_name?: string | null
  attendance_date?: string | null
  date?: string | null
  attendance_time?: string | null
  time?: string | null
  late_seconds?: number | string | null
  delay?: number | string | null
  lateness?: number | string | null
  late?: number | string | null
  student?: {
    id?: number | string | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
    full_name?: string | null
    group_id?: number | string | null
    group?: { id?: number | string; name?: string | null; name_uz?: string | null } | null
  } | null
  group?: { id?: number | string; name?: string | null; name_uz?: string | null } | null
  organization?: { name?: string | null; inn?: string | null } | null
}
