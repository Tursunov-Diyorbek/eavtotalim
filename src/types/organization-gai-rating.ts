export type GaiRatingDetails = Record<string, string | number | null | undefined>

export type GaiRatingCriterion = {
  code?: string
  score?: number | string | null
  title?: string
  name?: string
  criteria_name?: string
  details?: GaiRatingDetails | null
  period_start_date?: string | null
  period_end_date?: string | null
  organization_gai_rating_criteria?: {
    code?: string
    title?: string
    name?: string
  } | null
}

export type GaiRatingPlace = {
  name?: string
  name_uz?: string
  name_ru?: string
  name_kiril?: string
}

export type GaiRatingRecord = {
  id?: number
  score?: number | string | null
  year?: number | string | null
  period_start_date?: string | null
  period_end_date?: string | null
  period_type?: string | null
  organization?: {
    name?: string
    name_uz?: string
    inn?: string
  } | null
  organization_gai_rating_criteria?: {
    title?: string
    name?: string
    code?: string
  } | null
}

export type GaiRatingRow = {
  id?: number
  organization_id?: number
  name?: string
  name_uz?: string
  organization_name?: string
  inn?: string
  organization_inn?: string
  year?: number
  period?: number
  total_score?: number | string | null
  score?: number | string | null
  umumiy_ball?: number | string | null
  category?: string
  category_label?: string
  region?: GaiRatingPlace | null
  area?: GaiRatingPlace | null
  region_name?: string
  area_name?: string
  organization?: {
    name?: string
    name_uz?: string
    inn?: string
    region?: GaiRatingPlace | null
    area?: GaiRatingPlace | null
  } | null
  criteria?: GaiRatingCriterion[] | null
  ratings?: GaiRatingCriterion[] | null
  organization_gai_ratings?: GaiRatingCriterion[] | null
  items?: GaiRatingCriterion[] | null
}
