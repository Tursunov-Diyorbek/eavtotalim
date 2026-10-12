export type GroupApplicationStudent = {
  id?: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  full_name?: string | null
  birthday?: string | null
}

export type GroupApplicationRow = {
  id: number
  status?: string | null
  application_created_time?: string | null
  deadline?: string | null
  actioned_time?: string | null
  organization?: {
    name?: string | null
    name_uz?: string | null
    inn?: string | null
  } | null
  uztelecom_aes_event?: { task_id?: string | number | null } | null
  uztelecom_aes_event_group?: {
    group_name?: string | null
    edu_type?: { name?: string | null; short_name?: string | null } | null
    event_students?: GroupApplicationStudent[] | null
  } | null
}
