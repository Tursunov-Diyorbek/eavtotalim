export type DailyPaymentByType = {
  name?: string | null
  payments?: Array<{ amount?: number | string | null }> | null
}

export type DailyPaymentItem = {
  id?: number
  amount?: number | string | null
  payment_date?: string | null
  student?: {
    id?: number
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  pay_type?: { id?: number; name?: string | null } | null
}

export type StudentImageStatsSummary = {
  total_students?: number | null
  with_image?: number | null
  without_image?: number | null
  percent_uploaded?: number | null
}

export type StudentImageGroupRow = {
  group_id: number
  group_name?: string | null
  edu_type_name?: string | null
  edu_type_code?: string | null
  total?: number | null
  with_image?: number | null
  without_image?: number | null
  percent_uploaded?: number | null
}

export type StudentImageStudentRow = {
  id: number
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  phone?: string | null
  image?: string | null
  exam_image?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  has_image?: boolean | number | string | null
}

export type StudentImageGroupStudentsPage = {
  data: StudentImageStudentRow[]
  total: number
  page: number
  lastPage: number
  perPage: number
}

export type StudentImageStudentStatus = 'all' | 'without_image' | 'with_image'

export type FaceControlWarning = {
  id: number
  text?: string | null
  created_at?: string | null
  is_seen?: boolean | number | null
  images?: string[] | null
}

export type FaceControlDashboard = {
  unseen_warnings_count?: number | null
  unseen_warnings?: FaceControlWarning[] | null
}

export type AutodromeFreeSpace = {
  a?: boolean | number | string | null
  b?: boolean | number | string | null
  e?: boolean | number | string | null
}

export type AutodromeWithCameras = {
  id: number
  name?: string | null
  inn?: string | null
  endDate?: string | null
  freeSpace?: AutodromeFreeSpace
  cameras: import('./autodrome-camera').AutodromeCameraItem[]
}
