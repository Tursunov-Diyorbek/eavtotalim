export type TuitionFeePrice = {
  id?: number
  price?: number | string | null
  first_pay?: number | string | null
}

export type TuitionFeeItem = {
  id: number
  name?: string | null
  short_name?: string | null
  short_name_uz?: string | null
  image?: string | null
  edu_type_price?: TuitionFeePrice | null
}
