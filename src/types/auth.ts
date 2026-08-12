export type MeUser = {
  id: number
  username: string
  phone?: string | null
  phone_verified_at?: string | null
  last_seen?: string | null
  online?: number
  org?: number
  image?: string | null
  status?: number
  /** Raqamli rol kodi: 777 superadmin, 1 director, 5 student, … */
  role: number
  /** String rollar: ["superadmin"], … */
  roles: string[]
  permissions: string[]
}

export type MeLangName = {
  uz?: string | null
  kiril?: string | null
  ru?: string | null
  qq?: string | null
  en?: string | null
}

export type MeRegionOrArea = {
  id: number
  name: string
  lang?: MeLangName | null
}

export type MeSchoolType = {
  id: number
  name: string
}

export type MeAgreementType = {
  id: number
  name_uz?: string | null
  name_ru?: string | null
  name_qq?: string | null
  name_kiril?: string | null
  name_en?: string | null
  description?: string | null
  percent?: number | null
  amount_per_student?: number | null
}

export type MeLastAgreement = {
  id: number
  organization_id?: number
  amount?: string | null
  date?: string | null
  students_count?: number | null
  agreement_number?: string | null
  status?: number | null
  agreement_type?: MeAgreementType | null
}

export type MeOrgLicense = {
  file?: string | null
  number?: string | null
  date?: string | null
}

export type MeOrganization = {
  id: number
  name: string
  inn?: string | null
  hr?: string | null
  region_id?: number | null
  area_id?: number | null
  operating_mode_id?: number | null
  school_type?: MeSchoolType | null
  address?: string | null
  phone?: string | null
  enable_payment?: number | null
  contract?: string | null
  is_face_control_blocked?: number | null
  license?: MeOrgLicense | null
  region?: MeRegionOrArea | null
  area?: MeRegionOrArea | null
  last_agreement?: MeLastAgreement | null
  agreement_type?: MeAgreementType | null
}

export type MeClassDate = {
  id: number
  group_id?: number | null
  start_time?: string | null
  end_time?: string | null
  is_monitored?: number | null
  organization_id?: number | null
  topic_id?: number | null
  average_attendance?: number | null
}

export type MeProfession = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  organization_id?: number | null
  organization?: MeOrganization | null
  edu_type_id?: number | null
  mspd_getting?: number | null
  mspd_photo_getting?: number | null
  passport_given_date?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_given_place?: string | null
  address?: string | null
  birthday?: string | null
  image?: string | null
  is_a_or_b_group?: boolean | null
  class_date?: MeClassDate | null
  phone?: string | null
  debt?: number | string | null
  email?: string | null
  gender?: number | null
  region_id?: number | null
}

export type MeStudyAddress = {
  region?: string | null
  area?: string | null
  details?: string | null
}

export type MeStudyGroup = {
  id: number
  name: string
  edu_starting_date?: string | null
  edu_ending_date?: string | null
}

export type MeStudyOrganization = {
  id: number
  name: string
  inn?: string | null
  address?: MeStudyAddress | null
}

export type MeStudyAutodrome = {
  id: number
  name: string
  address?: MeStudyAddress | null
}

export type MeStudyCar = {
  id: number
  number: string
  name: string
}

export type MeStudyInfo = {
  group?: MeStudyGroup | null
  organization?: MeStudyOrganization | null
  autodrome?: MeStudyAutodrome | null
  cars?: MeStudyCar[] | null
}

export type MeData = {
  user: MeUser
  organization_id?: number | null
  profession?: MeProfession | null
  study_info?: MeStudyInfo | null
  organization_has_comfort_plan?: boolean | null
  is_practical_attendance_strict?: boolean | null
}
