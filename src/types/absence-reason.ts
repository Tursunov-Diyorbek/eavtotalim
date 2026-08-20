export type AbsenceReasonStatus =
  | 'approved'
  | 'pending'
  | 'pending_rollback'
  | 'rolled_back'
  | 'rejected'
  | string

export type AbsenceReasonStudent = {
  id?: number | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
}

export type AbsenceReasonRow = {
  id: number
  student_id?: number | null
  reason?: string | null
  from_date?: string | null
  to_date?: string | null
  status?: AbsenceReasonStatus | null
  document_url?: string | null
  student?: AbsenceReasonStudent | null
  group?: {
    id?: number | null
    name?: string | null
    name_uz?: string | null
    edu_type?: { short_name?: string | null } | null
  } | null
  organization?: {
    name?: string | null
    region?: { name?: string | null } | null
    area?: { name?: string | null } | null
  } | null
}

export type StudentAbsenceByStudentRow = {
  student_id?: number | null
  student?: AbsenceReasonStudent | null
  lessons_count?: number | string | null
  sum_reason_lesson?: number | string | null
  all_absences_count?: number | string | null
  lessons_until_now?: number | string | null
  applications?: AbsenceReasonRow[] | null
}
