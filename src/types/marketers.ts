export type MarketerItem = {
  id?: number | null
  user_id?: number | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  birthday?: string | null
  gender?: number | string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  passport_seria?: string | null
  passport_number?: string | null
  status?: number | string | null
  region?: { id?: number | null; name?: string | null } | null
  area?: { id?: number | null; name?: string | null } | null
  region_id?: number | string | null
  area_id?: number | string | null
}
