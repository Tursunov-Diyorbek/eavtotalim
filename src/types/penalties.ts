/** Yo‘l harakati jarimalari */

export type PenaltyCategory = {
  id: number
  name_uz?: string | null
  name_ru?: string | null
  name_en?: string | null
  name_qq?: string | null
  name_kiril?: string | null
  name_kr?: string | null
}

/** Kategoriya ichidagi qisqa kartochka */
export type PenaltyListItem = {
  id: number
  body?: string | null
  article?: string | number | null
}

/** Modal / show — jarima miqdorlari bandlari */
export type PenaltyAmountItem = {
  id?: number
  type_id?: number | null
  ph_per_amount_type?: number | null
  ph_per_amount_from?: string | number | null
  ph_per_amount_to?: string | number | null
  ph_per_deprivation_driver_type?: number | null
  ph_per_deprivation_driver_from?: string | number | null
  ph_per_deprivation_driver_to?: string | number | null
  ph_per_imprisonment_type?: number | null
  ph_per_imprisonment_from?: string | number | null
  ph_per_imprisonment_to?: string | number | null
  ph_per_penalty_area?: number | null
  ph_additional?: string | null
  leg_per_amount_type?: number | null
  leg_per_amount_from?: string | number | null
  leg_per_amount_to?: string | number | null
  leg_per_deprivation_driver_type?: number | null
  leg_per_deprivation_driver_from?: string | number | null
  leg_per_deprivation_driver_to?: string | number | null
  leg_per_imprisonment_type?: number | null
  leg_per_imprisonment_from?: string | number | null
  leg_per_imprisonment_to?: string | number | null
  leg_per_penalty_area?: number | null
  leg_additional?: string | null
}

export type PenaltyDetail = {
  id?: number
  article?: string | number | null
  body?: string | null
  for_cars?: number | null
  for_truck?: number | null
  for_motorcycle?: number | null
  for_public_transport?: number | null
  penalties?: PenaltyAmountItem[] | null
}
