/** GET /v2/api/my-profile — o‘quvchi profil (toifa, guruh, …) */

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

export type MyProfileStudent = {
  id?: number
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  phone?: string | null
}

export type MyProfileData = {
  student?: MyProfileStudent | null
  group?: MyProfileGroup | null
}
