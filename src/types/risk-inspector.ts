export type RiskInspectorPassport = {
  serial?: string | null
  number?: string | null
  pinfl?: string | null
}

export type RiskInspectorRow = {
  id: number
  full_name?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  phone?: string | null
  birth_date?: string | null
  created_at?: string | null
  passport?: RiskInspectorPassport | null
}

/** MSPD `person-info` javobi. Saqlashda shu obyekt yuboriladi. */
export type InspectorPerson = {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  passport_jshir?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  birthday?: string | null
  gender?: string | null
  passport_given_place?: string | null
  passport_given_date?: string | null
}
