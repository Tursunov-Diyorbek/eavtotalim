export type RegionReportEduType = {
  id: number | null
  shortName: string
  code: string
}

export type RegionReportRow = {
  regionId: number | null
  regionName: string
  active: number
  archive: number
  byEdu: number[]
}

export type RegionReport = {
  eduTypes: RegionReportEduType[]
  rows: RegionReportRow[]
}

export type AreaReportRow = {
  areaId: number | null
  areaName: string
  schools: number
  schoolByEdu: number[]
  groups: number
  students: number
  studentByEdu: number[]
}

export type AreaReport = {
  regionId: number | null
  regionName: string
  eduTypes: RegionReportEduType[]
  rows: AreaReportRow[]
}

export type OrgReportRow = {
  id: number | null
  name: string
  active: boolean
  byEdu: number[]
}

export type OrgReport = {
  areaName: string
  eduTypes: RegionReportEduType[]
  rows: OrgReportRow[]
}
