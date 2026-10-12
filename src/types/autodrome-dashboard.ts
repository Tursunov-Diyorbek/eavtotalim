import type { AutodromeCameraItem } from '@/types/autodrome-camera'

export type AutodromeWidgets = {
  todays_groups_count?: number | null
  todays_present_students_count?: number | null
  todays_students_count?: number | null
  total_groups_count?: number | null
  total_students_count?: number | null
}

export type AutodromeAttendanceChart = {
  counts?: {
    totalStudents?: number | string | null
    visitedStudents?: number | string | null
    notVisitedStudents?: number | string | null
  } | null
  percentages?: {
    visited_students?: number | string | null
    not_visited_students?: number | string | null
  } | null
  chart?: {
    datasets?: { data?: Array<number | string | null> }[] | null
  } | null
}

export type AutodromeWeekday = {
  day?: number | null
  part?: number | null
}

export type AutodromeTodayGroup = {
  id?: number
  name?: string | null
  organization?: { name?: string | null } | null
  edu_type?: { code?: string | null; short_name?: string | null } | null
  weekdays?: AutodromeWeekday[] | null
  autodrome_students_count?: number | null
  students_count?: number | null
  today_day_part?: number | string | null
}

export type PassedCameraStudent = {
  id?: number
  full_name?: string | null
  group_id?: number | null
  group_name?: string | null
  organization_name?: string | null
  first_entry?: string | null
}

export type AutodromeTodayVisitor = {
  id?: number
  full_name?: string | null
  group?: { group?: string | null; name?: string | null } | null
  organization?: { name?: string | null } | null
  edu_type?: { code?: string | null; short_name?: string | null } | null
}

export type AutodromeMyCameras = {
  cameras: AutodromeCameraItem[]
  syncedAt?: string | null
}
