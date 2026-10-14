export type ResolutionCountRow = {
  id: number | null
  name: string
  schools: number
  faceId: number
  gps: number
  cars: number
  test: number
  monitoring: number
  contract: number
}

export type ResolutionSchoolRow = {
  id: number | null
  name: string
  inn: string
  face: string
  gps: number
  cars: number
  guide: string
  monitoring: boolean
  monitoringLegacy: boolean
  contractStatus: number | null
  agreementFile: string
  autodromeFile: string
  autodromeStatusId: number | null
  operatingMode: number | null
}
