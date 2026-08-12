/** O‘quvchi davomatlari */

export type TheoreticalAttendanceRecord = {
  type?: string | null
  attendance_time?: string | null
  current_image?: string | null
  [key: string]: unknown
}

/** Sana → yozuvlar (YYYY-MM-DD) */
export type TheoreticalAttendanceByDate = Record<
  string,
  TheoreticalAttendanceRecord[]
>

export type PracticalAttendanceItem = {
  id?: number
  attendance_date?: string | null
  attendance_time?: string | null
  confirmed_at?: string | null
  confirmed_by?: { name?: string | null } | null
  status?: 'verified' | 'confirmed' | 'rejected' | string | null
}

export type AutodromeAttendanceProgress = {
  completed_hours?: number | null
  required_hours?: number | null
  percentage?: number | null
}

export type AutodromeAttendanceItem = {
  id?: number
  date?: string | null
  autodrome?: { name?: string | null } | null
  first_entry?: string | null
  last_exit?: string | null
  seans?: number | null
  hours?: number | null
  status?: number | boolean | null
}

export type AutodromeAttendancePayload = {
  progress?: AutodromeAttendanceProgress | null
  data?: AutodromeAttendanceItem[] | null
  items?: AutodromeAttendanceItem[] | null
}
