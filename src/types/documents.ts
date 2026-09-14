export type PrintPerson = {
  id?: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  birthday?: string | null
  created_at?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_given_date?: string | null
  passport_given_place?: string | null
  address?: string | null
  constant_address?: string | null
  phone1?: string | null
  phone2?: string | null
  phone?: string | null
  image?: string | null
  gender?: number | string | null
  area?: { name?: string | null } | null
  final_mark?: {
    sertificate_seria?: string | null
    sertificate_number?: string | null
  } | null
  student_temp_certificate?: {
    certificate_serial?: string | null
    certificate_number?: string | null
  } | null
}

export type PrintEduType = {
  id?: number
  short_name?: string | null
  short_name_en?: string | null
  short_name_uz?: string | null
  name_uz?: string | null
  character_name?: string | null
}

export type PrintRegion = {
  name?: string | { uz?: string | null; ru?: string | null; kiril?: string | null } | null
  name_uz?: string | null
  lang?: { uz?: string | null; ru?: string | null } | null
}

export type PrintOrganization = {
  name?: string | null
  name_uz?: string | null
  name_kiril?: string | null
  agreement?: number | string | null
  inn?: string | null
  address?: string | null
  phone?: string | null
  hr?: string | null
  mfo?: string | null
  email?: string | null
  region_id?: number | string | null
  region?: PrintRegion | null
}

export type PrintGroupName = {
  uz?: string | null
  ru?: string | null
  kiril?: string | null
}

export type PrintGroupInfo = {
  id?: number
  name?: PrintGroupName | string | null
  name_uz?: string | null
  edu_type?: PrintEduType | null
  week_days?: string | number[] | null
  practical_week_days?: string | number[] | null
  start_time?: string | null
  end_time?: string | null
  practical_start_time?: string | null
  practical_end_time?: string | null
  edu_starting_date?: string | null
  edu_ending_date?: string | null
}

export type PrintGroupData = {
  status?: number | boolean
  students?: PrintPerson[] | null
  edu_type?: PrintEduType | null
  organization?: PrintOrganization | null
  director?: PrintPerson | null
  group?: PrintGroupInfo | null
  region?: PrintRegion | null
  bank?: { bank_name?: string | null; bank_address?: string | null } | null
  organization_info?: {
    hr?: string | null
    mfo?: string | null
    okonh?: string | null
  } | null
  starting_date?: string | null
  ending_date?: string | null
  asosiy_oqituvchi?: { teacher?: PrintPerson | null } | null
  amaliy_usta?: { teacher?: PrintPerson | null } | null
  education_price?: number | string | null
  price?: number | string | null
  first_pay?: number | string | null
}

export type PrintTeacherRow = {
  id?: number
  type_teacher_for_group?: { name?: string | null } | null
  teacher?: PrintPerson | null
}

export type PrintRegTeacher = {
  id?: number
  fio?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  education_degree?: { name?: string | null } | null
  diplom_given_date?: string | null
  license_seria?: string | null
  license_number?: string | null
  license_date?: string | null
  certificate_seria?: string | null
  certificate_number?: string | null
  certificate_given_date?: string | null
  car?: {
    name?: string | null
    number?: string | null
    year_of_manufacture?: string | number | null
  } | null
}

export type PrintTeachersPayload = {
  teachers: PrintRegTeacher[]
  practical_teachers: PrintRegTeacher[]
  rows: PrintTeacherRow[]
}

export type DocumentKind =
  | 'application'
  | 'contract'
  | 'registration'
  | 'statements'
  | 'voucher'
  | 'sheet'
  | 'sheet2'
  | 'mygov'
  | 'jurnal'
  | 'practical'
  | 'approved'
  | 'warning'
