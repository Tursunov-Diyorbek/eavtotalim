export type TeacherItem = {
  id: number
  user_id?: number | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  fio?: string | null
  birthday?: string | null
  gender?: number | string | null
  phone1?: string | null
  phone?: string | null
  address?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  passport_given_place?: string | null
  passport_given_date?: string | null
  status?: number | string | null
  mspd_status?: number | string | null
  citizenship?: { id?: number; name?: string | null; created_at?: string | null } | null
  citizenship_id?: number | string | null
  region?: { id?: number; name?: string | null } | null
  area?: { id?: number; name?: string | null } | null
  region_id?: number | string | null
  area_id?: number | string | null
  edu_types?: Array<number | string | { id?: number; short_name?: string | null }> | null
  edu_langs?: Array<number | string> | null
  type_id?: Array<number | string> | null
  education_degree?: { id?: number; name?: string | null } | null
  education_degree_id?: number | string | null
  institution_name?: string | null
  specialization?: string | null
  diplom_seria?: string | null
  diplom_number?: string | null
  diplom_given_date?: string | null
  license_seria?: string | null
  license_number?: string | null
  license_date?: string | null
  license_category_id?: Array<number | string> | null
  certificate_seria?: string | null
  certificate_number?: string | null
  certificate_given_date?: string | null
  image?: string | null
  groups?: Array<{
    id?: number
    name?: string | null
    name_uz?: string | null
    type_name?: string | null
    type_teacher_id?: number | string | null
  }> | null
}

/** O‘qituvchi kartochkasidagi biriktirilgan mashina (qisqa). */
export type TeacherLinkedCar = {
  id?: number
  name?: string | null
  number?: string | null
  photo?: string | null
  status?: number | string | null
  mspd_status?: number | string | null
  mspd_check_date?: string | null
}

export type TeacherGroupLink = {
  id?: number
  group?: {
    id?: number
    name?: string | null
    education_price?: number | string | null
    edu_starting_date?: string | null
    edu_ending_date?: string | null
    edu_type?: { short_name?: string | null; name?: string | null } | null
  } | null
  type_teacher_for_group?: { name?: string | null } | null
}

export type TeacherDetail = TeacherItem & {
  created_at?: string | null
  passport_copy?: string | null
  diplom_copy?: string | null
  diplom_application_copy?: string | null
  certificate?: string | null
  car?: TeacherLinkedCar | null
  teachers_for_group?: TeacherGroupLink[] | null
}

export type NamedId = {
  id: number
  name?: string | null
  name_uz?: string | null
  short_name?: string | null
  value?: number | string | null
  label?: string | null
}

export type TeacherCreateOptions = {
  citizenships?: NamedId[]
  edu_types?: NamedId[]
  education_degrees?: NamedId[]
  teacher_types?: NamedId[]
  license_category?: NamedId[]
}

export type TeachersFilters = {
  page: number
  showCount: number
  lastName?: string
  firstName?: string
  middleName?: string
  passportSeria?: string
  passportNumber?: string
  passportJshir?: string
  status?: string
  mspdStatus?: string
  /** 1 nazariy, 2 amaliy, 3 tibbiyot. Bo‘sh — barchasi. */
  typeId?: string
  sortKey?: string
  sortOrder?: 'ASC' | 'DESC'
}
