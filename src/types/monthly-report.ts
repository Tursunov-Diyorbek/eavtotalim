export type MonthlyReportRow = {
  name: string
  regionName: string
  areaName: string
  organizationId: number | null
  inn: string
  lessonSum: number | null
  absentSum: number | null
  absentPercent: number | null
  monitoringPercent: number | null
}

export type MonthlyReportList = {
  rows: MonthlyReportRow[]
  total: number
}
