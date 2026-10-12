export type SchoolReportRow = {
  id: number
  regionId: number | null
  name: string
  inn: string
  director: string
  teachers: number
  cars: number
  groups: number
  students: number
}

export type SchoolReportList = {
  rows: SchoolReportRow[]
  total: number
}

export type SchoolReportTotals = {
  schools: number
  groups: number
  students: number
}

export type SchoolReportGroup = {
  id: number
  name: string
  start: string
  end: string
  students: number
  average: number | null
  lastLessonDate: string
  lastAbsence: number | null
}

export type SchoolReportGroupList = {
  rows: SchoolReportGroup[]
  total: number
}

export type SchoolReportLesson = {
  id: string
  start: string
  end: string
  average: number
}

export type SchoolReportMark = {
  type: number
  value: string
  image: string
}

export type SchoolReportStudent = {
  id: number
  name: string
  marks: Record<string, SchoolReportMark>
}

export type SchoolReportMonitoring = {
  lessons: SchoolReportLesson[]
  students: SchoolReportStudent[]
}
