export type RiskIndicatorOption = {
  id: number
  name?: string | null
}

export type OrgRiskScoreItem = {
  risk_indicator?: {
    id?: number
    name?: string | null
    description?: string | null
    code?: string | null
  } | null
  monthly_risk_indicator_score?: {
    id?: number
    score?: number | string | null
    description?: string | null
    file_path?: string | null
  } | null
}

export type OrgRiskScoreRow = {
  sum_score?: number | string | null
  organization?: {
    id?: number
    name?: string | null
    name_uz?: string | null
    inn?: string | null
    region?: unknown
    area?: unknown
  } | null
  risk_indicators?: OrgRiskScoreItem[]
}

export type TaqdimnomaExisting = {
  id?: number
  score?: number | string | null
  month?: number | string | null
  year?: number | string | null
  created_at?: string | null
  updated_at?: string | null
  organization?: {
    name?: string | null
    inn?: string | null
    address?: string | null
  } | null
  risk_indicator?: {
    name?: string | null
    points?: number | string | null
    description?: string | null
  } | null
}

export type MonthlyRiskScoreRow = {
  id: number
  score?: number | string | null
  month?: number | string | null
  year?: number | string | null
  organization?: {
    name?: string | null
    name_uz?: string | null
    inn?: string | null
  } | null
  risk_indicator?: {
    id?: number
    name?: string | null
  } | null
}
