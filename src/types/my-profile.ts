import type { StudentAttendanceStats } from './student'

/** GET /v2/api/my-profile — o‘quvchi profil (eski StudentProfileV2) */

export type MyProfileEduType = {
  id?: number
  character_name?: string | null
  name?: string | null
  name_uz?: string | null
  name_for_exam?: string | null
}

export type MyProfileGroup = {
  id: number
  name?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
  edu_type?: MyProfileEduType | null
}

export type MyProfileOrganization = {
  id?: number
  name?: string | null
  name_uz?: string | null
  inn?: string | null
  hr?: string | null
  address?: string | null
  phone?: string | null
}

export type MyProfileStudent = {
  id?: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  phone?: string | null
  address?: string | null
  organization?: MyProfileOrganization | null
}

export type MyProfileData = {
  student?: MyProfileStudent | null
  group?: MyProfileGroup | null
  student_personal_attendance?: StudentAttendanceStats | null
}

/** GET /my-profile/payments */
export type MyProfilePaymentItem = {
  id?: number
  amount?: number | string | null
  payment_date?: string | null
  payment_type?: { name?: string | null } | null
}

export type MyProfilePaymentsData = {
  sum_payment?: number | string | null
  price?: number | string | null
  debt?: number | string | null
  payments?: MyProfilePaymentItem[] | null
}
