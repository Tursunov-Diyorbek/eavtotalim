/** GET /director/edit-my-data */
export type DirectorEditData = {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  passport_jshir?: string | null
  passport_given_place?: string | null
  birthday?: string | null
  gender?: number | string | null
  address?: string | null
  phone?: string | null
  /** 0 — yangi (shaxs maydonlari ochiq); 1 — bir marta saqlangan */
  new?: number | string | null
}

export type DirectorEditFormValues = {
  last_name: string
  first_name: string
  middle_name: string
  passport_seria: string
  passport_number: string
  passport_jshir: string
  passport_given_place: string
  birthday: string
  gender: string
  address: string
  phone: string
}

export type MspdPersonInfo = {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  birthday?: string | null
  passport_jshir?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  gender?: number | string | null
  passport_given_place?: string | null
  passport_given_date?: string | null
}

export type MspdSearchPayload = {
  passport_seria: string
  passport_number: string
  birthday: string
}

/** GET v2 /organization-info */
export type OrganizationInfo = {
  logo_image?: string | null
  name?: string | null
  name_uz?: string | null
  inn?: string | null
  hr?: string | null
  mfo?: string | null
  phone?: string | null
  license_file?: string | null
}
