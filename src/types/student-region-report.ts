export type StudentRegionEduType = {
  id: number | null
  name: string
  shortName: string
}

export type StudentRegionRow = {
  id: number | null
  name: string
  schools: number
  /** Qatorning `active_groups_count` qiymati. */
  groupCount: number
  /** Toifa bo‘yicha faol guruhlar (`edu_type_id`). */
  groupsByEdu: number[]
  /** Jadval katakidagi guruhlar. Viloyatda `active_groups_count`. */
  groups: number
  /** Kartochka va JAMI qatori: toifa bo‘yicha guruhlar yig‘indisi. */
  eduGroups: number
  studentsTotal: number
  students: number[]
}

export type StudentRegionReport = {
  eduTypes: StudentRegionEduType[]
  rows: StudentRegionRow[]
}
