/** GET /v2/api/my-profile/autodrome-status — kameraga yuborilish holati */

export type AutodromeEnrollmentAutodrome = {
  id?: number
  name?: string | null
  is_face_control?: boolean | number | null
}

export type AutodromeEnrollmentGroup = {
  id?: number
  name?: string | null
  synced?: boolean | null
  block_reason?: string | null
}

export type AutodromeEnrollmentAos = {
  status?: number | null
  status_label?: string | null
}

export type AutodromeEnrollmentData = {
  autodrome?: AutodromeEnrollmentAutodrome | null
  aos?: AutodromeEnrollmentAos | null
  group?: AutodromeEnrollmentGroup | null
  has_image?: boolean | null
  warning?: string | null
  reason?: string | null
}
