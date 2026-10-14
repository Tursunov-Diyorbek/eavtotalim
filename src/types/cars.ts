export type CarTeacherOption = NamedOption & {
  car?: {
    id?: number | string | null
    name?: string | null
    number?: string | null
  } | null
}

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
  organization?: { id?: number; name?: string | null; inn?: string | null } | null
  area?: { id?: number; name?: string | null } | null
  photo?: string | null
  image?: string | null
  car_category?: { id?: number; name?: string | null } | null
  group_cars?: {
    id?: number | null
    group?: {
      id?: number | null
      name?: string | null
      edu_status?: number | string | null
    } | null
  }[] | null
  mspd_type_id?: number | string | null
  mspd_type_name?: string | null
  mspd_body_type_id?: number | string | null
  mspd_body_type_name?: string | null
  is_educational?: boolean | number | null
  educational_source?: string | null
  educational_override?: number | string | null
  mspd_check_date?: string | null
}

export type CarDetail = CarItem & {
  model?: NamedOption | string | null
  car_model?: NamedOption | null
  type?: NamedOption | null
  car_type?: NamedOption | null
  color?: NamedOption | null
  car_color?: NamedOption | null
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
  pidal_photo?: string | null
  tex_passport_front?: string | null
  tex_passport_back?: string | null
  tex_front_image?: string | null
  tex_back_image?: string | null
  separate_characters?: string | null
  mspd_body_note?: string | null
  mspd_note?: string | null
  mspd_shassi?: string | null
  mspd_kuzov?: string | null
  detail?: {
    mileage_km?: number | string | null
    oil_change_mileage_km?: number | string | null
    condition_notes?: string | null
    condition_status?: string | null
    last_oil_change_date?: string | null
    last_tire_change_date?: string | null
  } | null
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
  /** Ruxsatli tashkilot barcha toifani tanlaydi. */
  can_set_car_category_manually?: boolean
  /** Tramvay toifasi — MSPD reestrida yo‘q, shu id bilan tanlanadi. */
  tram_category_id?: number | string | null
  teachers?: CarTeacherOption[]
  categories?: NamedOption[]
}

/** GET v2 /cars/:id/educational-history */
export type CarEducationalHistoryItem = {
  id: number
  new_is_educational?: boolean | number | null
  new_override?: number | string | null
  user?: string | { last_name?: string | null; first_name?: string | null; middle_name?: string | null } | null
  created_at?: string | null
  reason?: string | null
}

/** GET v2 /teachers/:id/car — o‘qituvchiga biriktirilgan mashinalar. */
export type TeacherCar = {
  id: number
  name?: string | null
  number?: string | null
  year_of_manufacture?: string | number | null
  status?: number | string | null
  mspd_status?: number | string | null
  mspd_model_name?: string | null
  tex_front_image?: string | null
  photo?: string | null
  image?: string | null
  front_photo?: string | null
  car_category?: { id?: number; name?: string | null } | null
  teacher?: {
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  group_cars?: {
    edu_starting_date?: string | null
    edu_ending_date?: string | null
    group?: {
      edu_starting_date?: string | null
      edu_ending_date?: string | null
      edu_type?: {
        name?: string | null
        short_name?: string | null
        name_for_exam?: string | null
        image?: string | null
      } | null
    } | null
  }[] | null
}

/** POST v2 /cars/:id/details */
export type CarDetailsPayload = {
  last_oil_change_date?: string
  last_tire_change_date?: string
  mileage_km?: number
  condition_status?: string
  condition_notes?: string
}

/** GET v2 /cars/:id/details — yurgan masofa, moy va shina. */
export type CarOperationalInfo = {
  mileage_km?: number | string | null
  condition_notes?: string | null
  condition_status?: string | null
  last_oil_change_date?: string | null
  last_tire_change_date?: string | null
  oil_change_mileage_km?: number | string | null
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
  mspdTypeId?: number | null
  mspdBodyTypeId?: number | null
  organizationId?: string
  /** `0` — o‘quv emas, `1` — o‘quv. Bo‘sh — filtr yo‘q. */
  educational?: '' | '0' | '1'
  regionId?: string
  areaId?: string
  inn?: string
  categoryId?: string
  includeArea?: boolean
}

export type EducationalShare = {
  total?: number
  educational?: number
  non_educational?: number
  educational_percent?: number
  non_educational_percent?: number
}

export type CarStatGroup = {
  id?: number | string | null
  name?: string | null
  count?: number
  categories?: { car_category_name?: string | null; count?: number }[]
}

export type CarStatistics = {
  body_types?: CarStatGroup[]
  transport_types?: CarStatGroup[]
  generated_at?: string | null
  from_cache?: boolean
}
