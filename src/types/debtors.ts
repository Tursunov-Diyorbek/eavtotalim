export type DebtorTeacher = {
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
}

export type DebtorGroupTeacher = {
  type_teacher_for_group?: { type_on_doc?: number | string | null } | null
  teacher?: DebtorTeacher | null
}

export type DebtorGroup = {
  id?: number
  name?: string | null
  name_uz?: string | null
  teachers?: DebtorGroupTeacher[] | null
}

export type DebtorRow = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  phone?: string | null
  debt?: number | string | null
  payments_sum_amount?: number | string | null
  group?: DebtorGroup | null
}

export type DebtorFilterGroup = {
  id: number
  name?: string | null
  name_uz?: string | null
}
