/** GET v2 /groups */

export type GroupEduStatusTab = 'all' | '0' | '1' | '2'

export type GroupEduType = {
  id?: number
  short_name?: string | null
  character_name?: string | null
  autodrome_hours?: number | string | null
  practical_hours?: number | string | null
}

export type GroupOrganization = {
  id?: number
  name?: string | null
  inn?: string | null
  address?: string | null
  region?: {
    name?: string | { uz?: string | null } | null
    name_kiril?: string | null
    name_uz?: string | null
  } | null
}

export type GroupItem = {
  id: number
  name?: string | null
  name_uz?: string | null
  edu_type?: GroupEduType | null
  grouped_students_count?: number | null
  education_price?: number | string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  start_time?: string | null
  end_time?: string | null
  week_days?: string | number[] | null
  edu_status?: number | string | null
  timetable?: number | string | null
  organization?: GroupOrganization | null
  inspection_group_report?: {
    average_attendance?: number | string | null
    last_lesson_absence_count?: number | string | null
  } | null
  /** `/groups/show/:id` qo‘shimcha maydonlari */
  students_count?: number | null
  check_gai?: number | string | null
  sms_sended?: number | string | null
  practical_week_days?: string | number[] | null
  practical_start_time?: string | null
  practical_end_time?: string | null
  edu_lang?: { id?: number | null; name?: string | null } | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: { name?: string | null } | null
  updated_by?: { name?: string | null } | null
  uztelecom_aes_event_id?: number | string | null
  car_category_edu_type_access?: string | string[] | null
}

/** GET v2 /groups/show/:id/students */
export type GroupStudentRow = {
  id: number
  user_id?: number | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  birthday?: string | null
  phone1?: string | null
  address?: string | null
  image?: string | null
  passport?: { jshir?: string | null } | null
  constant_region?: { name?: string | null } | null
  constant_area?: { name?: string | null } | null
  user?: { last_seen?: string | null } | null
  student_personal_attendance?: {
    average_attendance_percent?: number | string | null
    autodrome_attendance_count?: number | string | null
  } | null
  today_monitoring_camera_attendance?: {
    attendance_date?: string | null
    attendance_time?: string | null
  } | null
}

/** GET v2 /groups/show/:id/cars */
export type GroupCarRow = {
  id: number
  name?: string | null
  number?: string | null
  car_model?: { name?: string | null } | null
  teacher?: {
    id?: number | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
}

/** GET v2 /groups/show/:id/teachers */
export type GroupTeacherRow = {
  id?: number | null
  teacher?: {
    id?: number | null
    user_id?: number | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  type_teacher_for_group?: { name?: string | null } | null
}

/** GET v2 /groups/show/:id/timetable */
export type GroupTimetableHandout = {
  hours?: number | string | null
  topic?: {
    type?: number | string | null
    name?: { uz?: string | null } | string | null
    lesson?: { short_name?: string | null } | null
  } | null
}

export type GroupTimetableRow = {
  id?: number | null
  start_time?: string | null
  end_time?: string | null
  handouts?: GroupTimetableHandout[] | null
}

/** GET v2 /groups/:id/removed-students */
export type GroupRemovedStudentRow = {
  id?: number | null
  student?: {
    id?: number | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
    image?: string | null
  } | null
  group?: { name?: string | null } | null
  removed_at?: string | null
  removed_by?: { name?: string | null } | null
  device?: string | null
  ip_address?: string | null
  file_path?: string | null
}

/** GET v2 /groups/monitoring-camera-attendance */
export type GroupCameraAttendance = {
  type?: string | null
  attendance_time?: string | null
  current_image?: string | null
}

export type GroupIncomingStudents = {
  dates: string[]
  students: {
    id: number
    full_name?: string | null
    attendances?: Record<string, GroupCameraAttendance[]> | null
  }[]
}

/** GET v2 /groups/:id/student-credentials */
export type GroupCredentialRow = {
  student?: string | null
  username?: string | null
  password?: string | null
}

export type GroupCounts = {
  all?: number
  active?: number
  finished?: number
  new?: number
}

export type GroupsFilters = {
  page: number
  showCount: number
  eduStatus: GroupEduStatusTab
  name?: string
  eduTypeId?: number | null
  timetable?: string
  weekDays?: number[]
  startTime?: string
  endTime?: string
  sortKey?: string
  sortOrder?: 'ASC' | 'DESC'
}

export type CreateGroupPayload = {
  name_uz: string
  education_price: number | string
  start_time: string
  end_time: string
  edu_starting_date: string
  lang_id: number
  edu_type_id: number
  week_days: string[]
  practical_start_time: string
  practical_end_time: string
  practical_week_days: string[]
  part_number: string
  part_additional?: string
}

export type UpdateGroupPayload = {
  name_uz?: string
  education_price?: number | string
  start_time?: string
  end_time?: string
  week_days?: string[]
  practical_start_time?: string
  practical_end_time?: string
  practical_week_days?: string[]
}

export type GroupsPageData = {
  data: GroupItem[]
  total_items: number
  last_page: number
}

export type AvailableGroupCar = {
  id: number
  name?: string | null
  number?: string | null
  year_of_manufacture?: string | number | null
  mspd_status?: number | string | null
  status?: number | string | boolean | null
  teacher?: {
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  car_category?: { name?: string | null; code?: string | null } | null
}

export type GroupTeacherType = {
  id: number
  name?: string | null
}

export type MergeTeacherOption = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
}

export type GroupPaymentRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  education_price?: number | string | null
  payments?: { amount?: number | string | null }[] | null
}

export type GroupPayType = {
  id: number
  name?: string | null
}

/** GET v1 `/get-payments-by-group` */
export type GroupPaymentsData = {
  rows: GroupPaymentRow[]
  group: GroupItem | null
  payTypes: GroupPayType[]
}

export type GroupMonitoringDay = {
  id: number
  start_time?: string | null
  access_monitoring?: number | string | null
}

export type GroupMonitoringMark = {
  type?: number | string | null
  value?: string | number | null
}

export type GroupMonitoringStudent = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  image?: string | null
  mark_monitoring?: Record<string, GroupMonitoringMark> | null
}

export type GroupMonitoringTodayStudent = {
  student_id?: number | null
  current_image?: string | null
  attendance_time?: string | null
}

export type GroupMonitoringPayload = {
  data: GroupMonitoringDay[]
  students: GroupMonitoringStudent[]
  todays_attendances?: {
    date?: string | null
    students?: GroupMonitoringTodayStudent[] | null
  } | null
}

export type GroupFinalMarkStudent = {
  student?: {
    id?: number | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  final_mark?: {
    practical?: number | string | null
    mark1?: number | string | null
    mark2?: number | string | null
  } | null
  student_temp_certificate?: {
    id?: number | null
    is_show_to_student?: boolean | number | null
    certificate_serial?: string | null
    certificate_number?: string | null
  } | null
  student_personal_attendance?: {
    average_attendance_percent?: number | string | null
    practical_attendance_minutes?: number | string | null
    autodrome_attendance_count?: number | string | null
  } | null
  debt?: number | string | null
}

export type GroupFinalMarksPayload = {
  name?: string | null
  grouped_student?: GroupFinalMarkStudent[] | null
  edu_ending_date?: string | null
  edu_type?: {
    practical_hours?: number | string | null
    autodrome_hours?: number | string | null
  } | null
  final_statement?: {
    statement_date?: string | null
    statement_number?: string | null
  } | null
}

export type GroupFinalExamAttempt = {
  correct_answers_count?: number | null
  questions_count?: number | null
  result?: number | null
  start_time?: string | null
  status?: { name?: string | null } | null
}

export type GroupFinalExamResultRow = {
  student?: {
    id?: number | null
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  attempt?: GroupFinalExamAttempt | null
  start_time?: string | null
}

export type GroupFinalExamPayload = {
  name?: string | null
  results: GroupFinalExamResultRow[]
}
