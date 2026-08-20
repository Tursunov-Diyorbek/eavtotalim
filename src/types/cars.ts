export type NamedOption = {
  id: number | string
  name?: string | null
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  short_name?: string | null
  year?: string | number | null
}

export type CarItem = {
  id: number
  name?: string | null
  number?: string | null
  year_of_manufacture?: string | number | null
  status?: number | string | null
  gai_status?: number | string | null
  mspd_status?: number | string | null
  teacher?: {
    id?: number
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  organization?: { id?: number; name?: string | null } | null
}

export type CarDetail = CarItem & {
  model?: NamedOption | null
  car_model?: NamedOption | null
  type?: NamedOption | null
  color?: NamedOption | null
  fuel_type?: NamedOption | null
  car_category?: NamedOption | null
  yhx_department?: NamedOption | null
  model_id?: number | string | null
  type_id?: number | string | null
  color_id?: number | string | null
  teacher_id?: number | string | null
  fuel_type_id?: number | string | null
  yhx_department_id?: number | string | null
  car_category_id?: number | string | null
  body?: string | null
  engine_number?: string | null
  engine_power?: string | null
  full_weight?: string | null
  unloaded_weight?: string | null
  given_date?: string | null
  number_of_seats?: string | number | null
  number_of_standings?: string | number | null
  tex_passport_number?: string | null
  tex_passport_seria?: string | null
  photo?: string | null
  image?: string | null
  front_photo?: string | null
  back_photo?: string | null
  right_photo?: string | null
  left_photo?: string | null
  pedal_photo?: string | null
  tex_passport_front?: string | null
  tex_passport_back?: string | null
  status_gps?: number | string | null
  mspd_check_date?: string | null
  created_at?: string | null
  comments?: string | null
  special_marks?: string | null
  total_mileage?: string | number | null
  last_oil_change_date?: string | null
  last_tire_change_date?: string | null
  education_type?: NamedOption | null
  group_cars?: {
    id?: number | null
    name?: string | null
    check_gai?: number | string | null
    edu_starting_date?: string | null
    edu_ending_date?: string | null
    edu_status?: number | string | null
    group?: {
      id?: number | null
      name?: string | null
      check_gai?: number | string | null
      edu_starting_date?: string | null
      edu_ending_date?: string | null
      edu_status?: number | string | null
    } | null
  }[] | null
}

export type CarCreateOptions = {
  car_models?: NamedOption[]
  car_types?: NamedOption[]
  car_colors?: NamedOption[]
  years?: NamedOption[]
  fuel_types?: NamedOption[]
  yhx_managements?: NamedOption[]
}

export type CarCounts = {
  all?: number
  active?: number
  inactive?: number
}

export type CarsFilters = {
  page: number
  showCount: number
  name?: string
  number?: string
  status?: string
  gaiStatus?: string
  mspdStatus?: string
  eduTypeId?: number | null
}
