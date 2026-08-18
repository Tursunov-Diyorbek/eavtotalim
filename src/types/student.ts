export type StudentsListTab = 'all' | '0' | '1' | '2' | '3' | '4'

export type StudentEduType = {
  id?: number
  short_name?: string | null
  name?: string | null
  name_uz?: string | null
  edu_type_price?: { price?: number | null; first_pay?: number | null } | null
}

export type StudentNamedId = {
  id: number
  name?: string | null
  short_name?: string | null
}

export type StudentAttendanceStats = {
  average_attendance_percent?: number | string | null
  all_classes_count?: number | null
  ended_classes_count?: number | null
  absence_count?: number | null
}

export type StudentGroup = {
  id?: number
  name?: string | null
  name_uz?: string | null
  edu_type?: StudentEduType | null
  edu_lang?: { id?: number; name?: string | null } | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  week_days?: string | number[] | null
  practical_week_days?: string | number[] | null
  start_time?: string | null
  end_time?: string | null
  practical_start_time?: string | null
  practical_end_time?: string | null
  uztelecom_aes_event?: { task_id?: string | number | null } | null
  group_type?: { id?: number | null } | null
}

export type StudentItem = {
  id: number
  user_id?: number | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  birthday?: string | null
  phone1?: string | null
  phone?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  passport_given_date?: string | null
  passport_given_place?: string | null
  grouped?: number | string | null
  edu_status?: number | string | null
  edu_type_id?: number | string | null
  edu_type?: StudentEduType | null
  mspd_getting?: number | string | null
  mspd_photo_getting?: number | string | null
  mspd_checked_date?: string | null
  gender?: number | string | null
  address?: string | null
  image?: string | null
  organization?: { id?: number; name?: string | null; name_uz?: string | null } | null
  grouped_student?: { group?: StudentGroup | null } | null
  group?: StudentGroup | null
  passport?: { serial?: string | null; number?: string | null } | null
  constant_address?: string | null
  constant_region_id?: number | string | null
  constant_area_id?: number | string | null
  constant_region?: { id?: number; name?: string | null } | null
  constant_area?: { id?: number; name?: string | null } | null
  citizenship_id?: number | string | null
  citizenship?: { id?: number; name?: string | null } | null
  social_status_id?: number | string | null
  is_low_security?: number | string | null
  edu_lang?: number | string | { id?: number; name?: string | null } | null
  edu_lang_id?: number | string | null
  medical_sertificate?: string | null
  exam_image?: string | null
  document_copy?: string | null
  is_join_autodrome?: number | boolean | null
  student_personal_attendance?: StudentAttendanceStats | null
  monitoring_camera_pending_student?: {
    status?: number | null
    image?: string | null
  } | null
  exclusions?: { group_id?: number; excluded_date?: string | null }[] | null
  document_type_id?: number | string | null
  document_seria?: string | null
  document_number?: string | null
  document_given_date?: string | null
  document_given_place?: string | null
  deed_number?: string | null
  school_address?: string | null
  school_number?: string | null
  school_graduation_year?: number | string | null
  school_certificate_number?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: { name?: string | null } | null
  updated_by?: { name?: string | null } | null
}

export type StudentDetail = StudentItem

export type StudentShowPayload = {
  student: StudentItem
  group?: StudentGroup | null
}

export type StudentCreateOptions = {
  citizenships?: StudentNamedId[]
  social_statuses?: StudentNamedId[]
  edu_types?: StudentEduType[]
  regions?: StudentNamedId[]
  pay_type?: StudentNamedId[]
}

export type StudentCounts = {
  all?: number
  studying?: number
  finished?: number
  with_certificate?: number
  without_certificate?: number
  new?: number
}

export type StudentsFilters = {
  page: number
  showCount: number
  tab: StudentsListTab
  lastName?: string
  firstName?: string
  middleName?: string
  passportJshir?: string
  eduTypeId?: string
  mspdPhoto?: string
  eduStatus?: string
  sortKey?: string
  sortOrder?: 'ASC' | 'DESC'
}

export type StudentCertificateItem = {
  id: number
  certificate_serial?: string | null
  certificate_number?: string | null
  student?: StudentItem | null
  group?: StudentGroup | null
  organization?: { id?: number; name?: string | null; name_uz?: string | null } | null
}

export type StudentCertificateFilters = {
  page: number
  showCount: number
  lastName?: string
  firstName?: string
  middleName?: string
  passportJshir?: string
  certificateSerial?: string
  certificateNumber?: string
  groupName?: string
}

export type StudentWithoutCertificateFilters = {
  page: number
  showCount: number
  lastName?: string
  firstName?: string
  middleName?: string
  passportJshir?: string
  organizationName?: string
}

export type StudentAttendanceLog = {
  id?: number
  attendance_date?: string | null
  attendance_time?: string | null
  type?: string | null
  date?: string | null
  first_entry?: string | null
}

export type AutodromeAttendanceSummary = {
  completed_seans?: number | null
  required_seans?: number | null
  completed_hours?: number | null
  required_hours?: number | null
}

export type StudentPaymentItem = {
  id?: number
  amount?: number | string | null
  payment_date?: string | null
}

export type StudentExamResultItem = {
  id?: number
  exam_name?: string | null
  correct_answers_count?: number | null
  question_count?: number | null
}

export type StudentCameraStatus = {
  status?: number | string | null
  message?: string | null
  image?: string | null
  pending_image?: string | null
}

export type StudentContractInfo = {
  status?: number | null
  edu_type_price?: { price?: number | null; first_pay?: number | null } | null
  student?: StudentItem | null
  group?: StudentGroup | null
  organization?: { name_uz?: string | null; name?: string | null } | null
  director?: {
    first_name?: string | null
    last_name?: string | null
    middle_name?: string | null
  } | null
}

export type ExamCenterResultItem = {
  id?: number
  result?: boolean | null
  score?: number | null
  date?: string | null
  exam_date?: string | null
  category_flag?: string | number | null
  region?: { name?: string | null } | null
  area?: { name?: string | null } | null
}

export type PracticalAttendanceItem = {
  id?: number
  date?: string | null
  attendance_date?: string | null
  attendance_time?: string | null
  status?: string | null
  qr?: string | null
  face_check_image?: string | null
  face_check_result?: number | null
  confirmed_by?: string | { name?: string | null } | null
  confirmed_at?: string | null
}

export type StudentClassDateItem = {
  id?: number
  lesson_date?: string | null
  start_time?: string | null
  end_time?: string | null
  note?: string | null
  is_attendance?: boolean | number | null
}

export type StudentClassDatesPayload = {
  from_date?: string | null
  to_date?: string | null
  data: StudentClassDateItem[]
}

export type StudentSchoolInfoPayload = {
  school_address?: string | null
  school_number?: string | null
  school_graduation_year?: number | null
  school_certificate_number?: string | null
}

export type StudentAdditionalInfoPayload = {
  phone1?: string
  address?: string
  medical_sertificate?: string
}
