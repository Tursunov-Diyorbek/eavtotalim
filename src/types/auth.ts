export type MeUser = {
  id: number
  username: string
  phone?: string | null
  phone_verified_at?: string | null
  last_seen?: string | null
  created_at?: string | null
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

export type MeOrgReport = {
  teachers_count?: number | null
  students_count?: number | null
  active_students_count?: number | null
  groups_count?: number | null
  active_groups_count?: number | null
  cars_count?: number | null
  count_car_with_gps?: number | null
  /** Tarif limiti (o‘quvchilar) */
  limit_students_count?: number | null
  /** Tarif bo‘yicha ishlatilgan */
  used_limit_count?: number | null
  /** Qoldiq (manfiy bo‘lishi mumkin) */
  students_agreement_limit_remainder?: number | null
  /** Limitdan oshgan (to‘lanmagan) o‘quvchilar */
  unpaid_students_count?: number | null
}

export type MeEduTypeReport = {
  edu_type_id: number
  students_count?: number | null
  active_students_count?: number | null
  ended_students_count?: number | null
  access_organization?: unknown | null
  name?: string | null
}

export type MeFaceControl = {
  name?: string | null
  phone?: string | null
}

export type MeStudyPlatformAgreement = {
  face_control?: MeFaceControl | null
  study_guide?: { name?: string | null } | null
  monitoring?: number | null
}

export type MeExaminationAreaAgreement = {
  autodrome?: { id?: number; name?: string | null } | null
  start_date?: string | null
  end_date?: string | null
  file?: string | null
  organization_autodrome_agreement_status?: {
    id?: number
    title?: string | null
  } | null
}

export type MeOrganization = {
  id: number
  name: string
  name_uz?: string | null
  inn?: string | null
  hr?: string | null
  mfo?: string | null
  region_id?: number | null
  area_id?: number | null
  operating_mode_id?: number | null
  school_type?: MeSchoolType | null
  address?: string | null
  y_address?: string | null
  phone?: string | null
  phone1?: string | null
  enable_payment?: number | null
  contract_date?: string | null
  invoys_number?: string | null
  license_number?: string | null
  license_date?: string | null
  contract?: string | null
  license_file?: string | null
  is_face_control_blocked?: number | null
  license?: MeOrgLicense | null
  region?: MeRegionOrArea | null
  area?: MeRegionOrArea | null
  last_agreement?: MeLastAgreement | null
  agreement_type?: MeAgreementType | null
  /** Barcha shartnomalar (header tarif modal) */
  agreements?: MeLastAgreement[] | null
  /** Shartnomalar bo‘yicha limit yig‘indisi */
  sum_students_from_agreements?: number | null
  report?: MeOrgReport | null
  report_by_edu_type?: MeEduTypeReport[] | null
  study_platform_agreement?: MeStudyPlatformAgreement | null
  examination_area_agreement?: MeExaminationAreaAgreement | null
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
  phone1?: string | null
  phone2?: string | null
  constant_address?: string | null
  institution_name?: string | null
  specialization?: string | null
  diplom_seria?: string | null
  diplom_number?: string | null
  diplom_given_date?: string | null
  passport_copy?: string | null
  diplom_copy?: string | null
  diplom_application_copy?: string | null
  debt?: number | string | null
  email?: string | null
  gender?: number | null
  region_id?: number | null
  /** 1 = MSPD tasdiqlangan; 0/2 = tasdiqlanmagan */
  mspd_status?: number | null
  passport_jshir?: string | null
  new?: number | null
  fio?: string | null
  created_at?: string | null
  autodrome?: {
    id?: number
    name?: string | null
    inn?: string | null
    created_at?: string | null
  } | null
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
  edu_type?: {
    character_name?: string | null
    name?: string | null
    name_uz?: string | null
  } | null
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
