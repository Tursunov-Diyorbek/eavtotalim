/** GET /students/:id/group-details */

export type GroupTeacher = {
  id?: number
  full_name?: string | null
  specialization?: string | null
}

export type GroupCar = {
  id?: number
  name?: string | null
  number?: string | null
  photo?: string | null
}

export type GroupDetailsData = {
  teachers?: GroupTeacher[] | null
  cars?: GroupCar[] | null
}
