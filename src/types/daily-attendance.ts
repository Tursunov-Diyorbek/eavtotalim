export type DailyAttendanceRow = {
  name: string
  kiril: string
  regionId: number | null
  orgId: number | null
  activeSchools: number
  allSchools: number
  lessonGroups: number
  activeGroups: number
  lessonStudents: number
  activeStudents: number
  absent: number
  absentPercent: number | null
  monitoringPercent: number | null
}

export type DailyAttendanceTypeRow = {
  name: string
  organizations: number
  activeOrganizations: number
  activeGroups: number
  lessonGroups: number
  activeStudents: number
  lessonStudents: number
  absent: number
  monitoringPercent: number | null
  absentPercent: number | null
}

export type DailyAttendanceList<T> = {
  rows: T[]
  total: number
}
