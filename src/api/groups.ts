import { apiClient, apiClientV2, withAccessToken } from './client'
import {
  assertOk,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  CreateGroupPayload,
  GroupCarRow,
  GroupCounts,
  GroupCredentialRow,
  GroupIncomingStudents,
  GroupItem,
  GroupRemovedStudentRow,
  GroupStudentRow,
  GroupTeacherRow,
  GroupTimetableRow,
  AvailableGroupCar,
  GroupFinalExamPayload,
  GroupFinalExamResultRow,
  GroupFinalMarksPayload,
  GroupMonitoringPayload,
  GroupPaymentRow,
  GroupsFilters,
  GroupsPageData,
  GroupTeacherType,
  MergeTeacherOption,
  UpdateGroupPayload,
} from '@/types/groups'

const RELATIONS = [
  'organization',
  'grouped_students_count',
  'inspection_group_report',
]

/** GET v2 /groups/get-group-counts */
export async function fetchGroupCounts(): Promise<GroupCounts> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: GroupCounts
    message?: string
  }>('/groups/get-group-counts')
  assertOk(res)
  return res.data ?? {}
}

/** GET v2 /groups — direktor guruhlar ro‘yxati */
export async function fetchGroups(
  filters: GroupsFilters,
): Promise<GroupsPageData> {
  const filterItems: FilterItem[] = []

  if (filters.eduStatus !== 'all') {
    filterItems.push({
      fieldKey: 'edu_status',
      fieldOperator: '=',
      fieldValue: filters.eduStatus,
    })
  }
  if (filters.eduTypeId != null) {
    filterItems.push({
      fieldKey: 'edu_type_id',
      fieldOperator: '=',
      fieldValue: filters.eduTypeId,
    })
  }
  const name = filters.name?.trim()
  if (name) {
    filterItems.push({
      fieldKey: 'name_uz',
      fieldOperator: 'LIKE',
      fieldValue: name,
    })
  }
  if (filters.timetable !== undefined && filters.timetable !== '') {
    filterItems.push({
      fieldKey: 'timetable',
      fieldOperator: '=',
      fieldValue: filters.timetable,
    })
  }
  if (filters.weekDays && filters.weekDays.length > 0) {
    filterItems.push({
      fieldKey: 'week_days',
      fieldOperator: 'LIKE',
      fieldValue:
        filters.weekDays.length === 1
          ? filters.weekDays[0]
          : JSON.stringify(filters.weekDays.map(String)),
    })
  }
  if (filters.startTime) {
    filterItems.push({
      fieldKey: 'start_time',
      fieldOperator: '>=',
      fieldValue: filters.startTime.length === 5 ? `${filters.startTime}:00` : filters.startTime,
    })
  }
  if (filters.endTime) {
    filterItems.push({
      fieldKey: 'end_time',
      fieldOperator: '<=',
      fieldValue: filters.endTime.length === 5 ? `${filters.endTime}:00` : filters.endTime,
    })
  }

  const extra: Record<string, string> = { without_students: '1' }
  RELATIONS.forEach((rel, i) => {
    extra[`relations[${i}]`] = rel
  })

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: filterItems,
    sort: filters.sortKey
      ? [{ fieldKey: filters.sortKey, fieldValue: filters.sortOrder ?? 'ASC' }]
      : undefined,
    extra,
  })

  const res = await apiClientV2.get<Record<string, unknown>>(`/groups?${query}`)
  assertOk(res)
  const page = unwrapPage<GroupItem>(res, filters.page, filters.showCount)
  return {
    data: page.data,
    total_items: page.total_items,
    last_page: page.last_page,
  }
}

export async function createGroup(payload: CreateGroupPayload) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    validator_errors?: unknown
  }>('/groups', payload)
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

export async function deleteGroup(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/groups/${id}`)
  assertOk(res)
  return res
}

/** GET v2 /groups/show/:id */
export async function fetchGroupShow(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/groups/show/${id}`)
  assertOk(res)
  return unwrapEntity<GroupItem>(res)
}

/** GET v2 /groups/show/:id/students */
export async function fetchGroupShowStudents(id: string, page = 1, showCount = 50) {
  const query = buildListQuery({ page, show_count: showCount })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/show/${id}/students?${query}`,
  )
  assertOk(res)
  return unwrapPage<GroupStudentRow>(res, page, showCount)
}

/** GET v2 /groups/show/:id/timetable */
export async function fetchGroupTimetable(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/show/${id}/timetable`,
  )
  assertOk(res)
  return unwrapPage<GroupTimetableRow>(res).data
}

/** GET v2 /groups/show/:id/cars */
export async function fetchGroupCars(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/groups/show/${id}/cars`)
  assertOk(res)
  return unwrapPage<GroupCarRow>(res).data
}

/** GET v2 /groups/show/:id/teachers */
export async function fetchGroupTeachers(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/show/${id}/teachers`,
  )
  assertOk(res)
  return unwrapPage<GroupTeacherRow>(res).data
}

/** GET v2 /groups/:id/removed-students */
export async function fetchGroupRemovedStudents(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/${id}/removed-students`,
  )
  assertOk(res)
  return unwrapPage<GroupRemovedStudentRow>(res).data
}

/** GET v2 /groups/:id/student-credentials */
export async function fetchGroupCredentials(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/${id}/student-credentials`,
  )
  assertOk(res)
  return unwrapPage<GroupCredentialRow>(res).data
}

/** GET v2 /groups/monitoring-camera-attendance — kamera orqali kelgan o‘quvchilar */
export async function fetchGroupIncomingStudents(
  id: string,
  year: number,
  month: number,
  search = '',
): Promise<GroupIncomingStudents> {
  const query = buildListQuery({
    extra: {
      group_id: id,
      year,
      month,
      student_search: search.trim() || undefined,
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/groups/monitoring-camera-attendance?${query}`,
  )
  assertOk(res)
  const body = (res.data ?? res) as Partial<GroupIncomingStudents>
  return {
    dates: Array.isArray(body.dates) ? body.dates : [],
    students: Array.isArray(body.students) ? body.students : [],
  }
}

/** POST v2 /groups-gai/send — YHXX ko‘rigiga yuborish */
export async function sendGroupToGai(id: number) {
  const form = new FormData()
  form.append('group_id', String(id))
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>('/groups-gai/send', form)
  assertOk(res)
  return res
}

/** GET v2 /organization-final-exam/by-group/:id — natijalar sahifasi uchun */
export async function fetchFinalExamByGroup(id: string) {
  try {
    const res = await apiClientV2.get<Record<string, unknown>>(
      `/organization-final-exam/by-group/${id}`,
    )
    const entity = unwrapEntity<{ id?: number | null }>(res)
    return entity?.id ?? null
  } catch {
    return null
  }
}

/** PUT v2 /groups/:id */
export async function updateGroup(id: string, payload: UpdateGroupPayload) {
  const res = await apiClientV2.put<{
    status?: number | boolean
    message?: string
    validator_errors?: unknown
  }>(`/groups/${id}`, payload)
  if (res.status === 2) {
    throw new Error(res.message || 'Validation error')
  }
  assertOk(res)
  return res
}

/** POST v2 /groups/fix-attendance/:id — dars qoldiruvlarni tozalab davomatni ko‘tarish */
export async function fixGroupAttendance(id: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: { students_processed?: number; absences_deleted?: number }
  }>(`/groups/fix-attendance/${id}`)
  assertOk(res)
  return res
}

/** POST v2 /groups/prepare-certificate/:id — yakuniy imtihon yozuvlarini tayyorlash */
export async function prepareGroupCertificate(id: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: {
      students_processed?: number
      attempts_created?: number
      results_created?: number
    }
  }>(`/groups/prepare-certificate/${id}`)
  assertOk(res)
  return res
}

/** POST v2 /groups/update-group-average-attendance/:id */
export async function updateGroupAverageAttendance(id: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/groups/update-group-average-attendance/${id}`)
  assertOk(res)
  return res
}

/** GET v1 /group-show — guruhga biriktirilmagan o‘quvchilar */
export async function fetchGroupUngroupedStudents(id: string) {
  const res = await apiClient.get<{
    status?: number | boolean
    message?: string
    data?: { ungrouped_students?: GroupStudentRow[] }
  }>(withAccessToken(`/group-show?group_id=${encodeURIComponent(id)}`))
  assertOk(res)
  return res.data?.ungrouped_students ?? []
}

/** POST v1 /add-to-group */
export async function addStudentsToGroup(groupId: string, studentIds: number[]) {
  const form = new FormData()
  form.append('group_id', groupId)
  form.append('students', JSON.stringify(studentIds))
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/add-to-group'), form)
  assertOk(res)
  return res
}

/** POST v1 /remove-from-group — o‘quvchilarni guruhdan chiqarish */
export async function removeStudentsFromGroup(
  groupId: string,
  studentIds: number[],
  file?: File | null,
) {
  const form = new FormData()
  form.append('group_id', groupId)
  studentIds.forEach((id) => form.append('students[]', String(id)))
  if (file) form.append('file', file)
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/remove-from-group'), form)
  assertOk(res)
  return res
}

/** GET v1 /index-group-cars — guruhga qo‘shilmagan mashinalar */
export async function fetchAvailableGroupCars(groupId: string) {
  const res = await apiClient.get<{
    status?: number | boolean
    message?: string
    no_added_cars?: AvailableGroupCar[]
  }>(withAccessToken(`/index-group-cars?group_id=${encodeURIComponent(groupId)}`))
  assertOk(res)
  return res.no_added_cars ?? []
}

/** POST v2 /group-cars/attach */
export async function attachCarsToGroup(groupId: string, carIds: number[]) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/group-cars/attach', { group_id: groupId, car_ids: carIds })
  assertOk(res)
  return res
}

/** POST v2 /group-cars/replace */
export async function replaceGroupCar(payload: {
  groupId: string
  oldCarId: number
  newCarId: number
  reason?: string
}) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/group-cars/replace', {
    group_id: payload.groupId,
    old_car_id: payload.oldCarId,
    new_car_id: payload.newCarId,
    reason: payload.reason ?? '',
  })
  assertOk(res)
  return res
}

/** POST v2 /cars/remove-from-group */
export async function removeCarFromGroup(groupId: string, carId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/cars/remove-from-group', { group_id: groupId, car_id: carId })
  assertOk(res)
  return res
}

/** GET v1 /types-teacher */
export async function fetchGroupTeacherTypes(groupId: string) {
  const res = await apiClient.get<{
    status?: number | boolean
    message?: string
    data?: GroupTeacherType[]
  }>(withAccessToken(`/types-teacher?group_id=${encodeURIComponent(groupId)}`))
  assertOk(res)
  return asNamedListFrom<GroupTeacherType>(res.data)
}

/** GET v1 /teachers-for-group-merge */
export async function fetchTeachersForGroupMerge() {
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken('/teachers-for-group-merge'),
  )
  assertOk(res)
  const page = unwrapPage<MergeTeacherOption>(res)
  return page.data
}

/** POST v1 /types-teacher-merge */
export async function addTeacherToGroup(
  groupId: string,
  teacherId: number,
  typeId: number,
) {
  const form = new FormData()
  form.append('group_id', groupId)
  form.append('teacher_id', String(teacherId))
  form.append('type_teacher_for_group_id', String(typeId))
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/types-teacher-merge'), form)
  assertOk(res)
  return res
}

/** POST v2 /group-teacher/un-merge */
export async function unmergeTeacherFromGroup(groupId: string, teacherId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>('/group-teacher/un-merge', { group_id: groupId, teacher_id: teacherId })
  assertOk(res)
  return res
}

/** POST v1 /timetable-store */
export async function createGroupTimetable(payload: {
  groupId: string
  weekDays: string[]
  startingTime: string
  duration: number
}) {
  const res = await apiClient.post<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/timetable-store'), {
    group_id: payload.groupId,
    week_days: JSON.stringify(payload.weekDays),
    duration: payload.duration,
    starting_time: payload.startingTime,
  })
  assertOk(res)
  return res
}

/** POST v1 /timetable-move-date-to-date */
export async function moveGroupTimetable(
  groupId: string,
  fromDate: string,
  toDate: string,
) {
  const form = new FormData()
  form.append('group_id', groupId)
  form.append('from_date', fromDate)
  form.append('to_date', toDate)
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/timetable-move-date-to-date'), form)
  assertOk(res)
  return res
}

/** POST v1 /mark-monitoring/show — elektron jurnal */
export async function fetchGroupMonitoring(groupId: string): Promise<GroupMonitoringPayload> {
  const form = new FormData()
  form.append('group_id', groupId)
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
    data?:
      | GroupMonitoringPayload['data']
      | {
          data?: GroupMonitoringPayload['data']
          students?: GroupMonitoringPayload['students']
          todays_attendances?: GroupMonitoringPayload['todays_attendances']
        }
    students?: GroupMonitoringPayload['students']
    todays_attendances?: GroupMonitoringPayload['todays_attendances']
  }>(withAccessToken('/mark-monitoring/show'), form)
  assertOk(res)
  const nested = res.data
  const days = Array.isArray(nested)
    ? nested
    : Array.isArray(nested?.data)
      ? nested.data
      : []
  const students = Array.isArray(res.students)
    ? res.students
    : nested && !Array.isArray(nested) && Array.isArray(nested.students)
      ? nested.students
      : []
  const todays =
    res.todays_attendances ??
    (nested && !Array.isArray(nested) ? nested.todays_attendances : null) ??
    null
  return { data: days, students, todays_attendances: todays }
}

/** POST v1 /timetable-store-alone — jurnal katag<ini saqlash */
export async function editGroupMonitoring(payload: {
  groupId: string
  studentId: number
  classDateId: number
  type: number
  value: string
  comment?: string
}) {
  const form = new FormData()
  form.append('group_id', payload.groupId)
  form.append('student_id', String(payload.studentId))
  form.append('class_date_id', String(payload.classDateId))
  form.append('type', String(payload.type))
  form.append('value', payload.value)
  form.append('comment', payload.comment ?? '')
  const res = await apiClient.postForm<{
    status?: number | boolean | string
    message?: string
  }>(withAccessToken('/timetable-store-alone'), form)
  assertOk(res)
  return res
}

/** GET v2 /monitoring-camera-attendance/get-again-attendance-and-monitoring-by-group-id-by-date/:groupId/:date */
export async function refreshGroupDayAttendance(groupId: string, date: string) {
  const res = await apiClientV2.get<{
    status?: number | boolean
    message?: string
  }>(
    `/monitoring-camera-attendance/get-again-attendance-and-monitoring-by-group-id-by-date/${groupId}/${date}`,
  )
  assertOk(res)
  return res
}

/** POST v2 /absence-reason/store-application — ma’lumotnoma bilan sababli */
export async function storeStudentAbsenceReason(formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    response_code?: number
    message?: string
  }>('/absence-reason/store-application', formData)
  if (res.response_code && res.response_code !== 200) {
    throw new Error(res.message || 'Request failed')
  }
  assertOk(res)
  return res
}

/** GET v1 /get-payments-by-group */
export async function fetchGroupPayments(groupId: string) {
  const res = await apiClient.get<{
    status?: number | boolean
    message?: string
    data?: { data?: GroupPaymentRow[] }
    group?: GroupItem
  }>(withAccessToken(`/get-payments-by-group?group_id=${encodeURIComponent(groupId)}`))
  assertOk(res)
  return res.data?.data ?? []
}

/** GET v2 /student-final-marks/by-group/:id */
export async function fetchGroupFinalMarks(groupId: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-final-marks/by-group/${groupId}`,
  )
  assertOk(res)
  const data = unwrapEntity<
    GroupFinalMarksPayload & { group?: { edu_ending_date?: string | null } }
  >(res)
  return {
    ...data,
    edu_ending_date: data.edu_ending_date ?? data.group?.edu_ending_date ?? null,
  }
}

/** POST v2 /final-mark/generate-certificate/:studentId */
export async function generateStudentCertificate(studentId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/final-mark/generate-certificate/${studentId}`)
  assertOk(res)
  return res
}

/** GET v2 /organization-final-exam/index/:id */
export async function fetchFinalExamResults(examId: string): Promise<GroupFinalExamPayload> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    message?: string
    data?: {
      name?: string | null
      results?: GroupFinalExamResultRow[]
      other_students?: GroupFinalExamResultRow[]
    }
  }>(`/organization-final-exam/index/${examId}`)
  assertOk(res)
  const results = res.data?.results ?? []
  const others = res.data?.other_students ?? []
  return {
    name: res.data?.name,
    results: [...results, ...others],
  }
}

/** POST v2 /groups/ensure-student-role-for-group/:id */
export async function ensureStudentRoleForGroup(groupId: string) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: {
      success?: boolean
      data?: { processed_students?: number; assigned_roles?: number }
      error?: string
    }
  }>(`/groups/ensure-student-role-for-group/${groupId}`)
  assertOk(res)
  return res
}

/** POST v2 /organization-final-exam/re-take-exam/:studentId */
export async function retakeFinalExam(studentId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/organization-final-exam/re-take-exam/${studentId}`)
  assertOk(res)
  return res
}

/** POST v2 /organization-final-exam/clear-student-final-exam-history/:studentId */
export async function clearStudentFinalExamHistory(studentId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/organization-final-exam/clear-student-final-exam-history/${studentId}`)
  assertOk(res)
  return res
}

/** POST v2 /student-final-marks/store-marks/:groupId */
export async function storeGroupFinalMarks(
  groupId: string,
  payload: {
    marks: { student_id: number; practical: number | string }[]
    statement_date?: string
    statement_number?: string
  },
) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/student-final-marks/store-marks/${groupId}`, payload)
  assertOk(res)
  return res
}

function asNamedListFrom<T extends { id?: number }>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if (Array.isArray(rec.data)) return rec.data as T[]
  }
  return []
}
