export type RefundGroupOption = {
  id: number
  name?: string | null
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  name_qq?: string | null
  name_en?: string | null
}

export type RefundStudentOption = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  all_payments?: number | string | null
  debt?: number | string | null
  education_price?: number | string | null
  image?: string | null
}

export type RefundPerson = {
  id?: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
}

export type RefundRow = {
  id?: number
  amount?: number | string | null
  returned_date?: string | null
  description?: string | null
  student?: RefundPerson | null
  group?: RefundGroupOption | null
}
