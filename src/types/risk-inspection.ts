export type InspectionStatus = {
  code?: string | null
  text?: string | null
  color?: string | null
}

export type RiskInspectionRow = {
  id: number
  year?: number | string | null
  month?: number | string | null
  created_at?: string | null
  status?: InspectionStatus | string | null
  organization?: {
    id?: number
    name?: string | null
    name_uz?: string | null
    inn?: string | null
  } | null
  inspectors?: { id?: number; full_name?: string | null }[] | null
}
