import { apiClient, apiClientV2, withAccessToken } from './client'
import {
  asNamedList,
  assertOk,
  buildListQuery,
  unwrapEntity,
  unwrapPage,
  type FilterItem,
} from '@/lib/apiPage'
import type {
  AutodromeAttendanceSummary,
  ExamCenterResultItem,
  PracticalAttendanceItem,
  StudentAttendanceLog,
  AutodromeCameraStatus,
  SchoolCameraStatus,
  StudentCertificateFilters,
  StudentCertificateItem,
  StudentClassDateItem,
  StudentClassDatesPayload,
  StudentContractInfo,
  StudentCounts,
  StudentCreateOptions,
  StudentDetail,
  StudentEduType,
  StudentExamResultItem,
  StudentGroup,
  StudentItem,
  StudentNamedId,
  StudentPaymentItem,
  StudentAdditionalInfoPayload,
  StudentSchoolInfoPayload,
  StudentsFilters,
  StudentShowPayload,
  StudentWithoutCertificateFilters,
} from '@/types/student'

function pushLike(items: FilterItem[], fieldKey: string, value?: string, wrap = true) {
  const trimmed = value?.trim()
  if (!trimmed) return
  items.push({
    fieldKey,
    fieldOperator: 'LIKE',
    fieldValue: wrap ? `%${trimmed}%` : trimmed,
  })
}

function pushEq(items: FilterItem[], fieldKey: string, value?: string | number) {
  if (value === undefined || value === null || value === '') return
  items.push({
    fieldKey,
    fieldOperator: '=',
    fieldValue: value,
  })
}

function relationsQuery(names: string[]) {
  return names
    .map((name, i) => `relations[${i}]=${encodeURIComponent(name)}`)
    .join('&')
}

/** GET v2 /students */
export async function fetchStudents(filters: StudentsFilters) {
  const items: FilterItem[] = []

  if (filters.tab === '0' || filters.tab === '1') {
    pushEq(items, 'grouped', Number(filters.tab))
  }

  pushLike(items, 'last_name', filters.lastName)
  pushLike(items, 'first_name', filters.firstName)
  pushLike(items, 'middle_name', filters.middleName)
  pushLike(items, 'passport_jshir', filters.passportJshir)
  if (filters.eduTypeId) {
    pushEq(items, 'edu_type_id', Number(filters.eduTypeId))
  }
  if (filters.mspdPhoto !== undefined && filters.mspdPhoto !== '') {
    pushEq(items, 'mspd_photo_getting', Number(filters.mspdPhoto))
  }
  if (filters.eduStatus !== undefined && filters.eduStatus !== '') {
    pushEq(items, 'edu_status', Number(filters.eduStatus))
  } else if (filters.tab === '1') {
    pushEq(items, 'edu_status', 1)
  } else if (filters.tab === '2') {
    pushEq(items, 'edu_status', 2)
  }

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
    sort: [
      {
        fieldKey: filters.sortKey || 'id',
        fieldValue: filters.sortOrder ?? 'DESC',
      },
    ],
  })

  const res = await apiClientV2.get<Record<string, unknown>>(`/students?${query}`)
  assertOk(res)
  return unwrapPage<StudentItem>(res, filters.page, filters.showCount)
}

function normalizeStudent(raw: StudentItem): StudentItem {
  const passport = raw.passport
  return {
    ...raw,
    passport_seria: raw.passport_seria ?? passport?.serial ?? null,
    passport_number: raw.passport_number ?? passport?.number ?? null,
  }
}

export function asStudentDetail(payload: StudentShowPayload): StudentDetail {
  return {
    ...normalizeStudent(payload.student),
    group: payload.group ?? payload.student.group ?? null,
  }
}

/** GET v2 /students/:id — `{ student, group }` */
export async function fetchStudent(id: string): Promise<StudentShowPayload> {
  const rel = relationsQuery(['student_personal_attendance'])
  const res = await apiClientV2.get<Record<string, unknown>>(`/students/${id}?${rel}`)
  assertOk(res)
  const raw = unwrapEntity<Record<string, unknown>>(res)
  if (raw.student && typeof raw.student === 'object' && !Array.isArray(raw.student)) {
    return {
      student: normalizeStudent(raw.student as StudentItem),
      group: (raw.group as StudentGroup) ?? null,
    }
  }
  return {
    student: normalizeStudent(raw as StudentItem),
    group: (raw.group as StudentGroup) ?? null,
  }
}

/** POST v1 /student-create — select optionlari */
export async function fetchStudentCreateOptions(): Promise<StudentCreateOptions> {
  const res = await apiClient.post<Record<string, unknown>>(
    withAccessToken('/student-create'),
  )
  const data = unwrapEntity<StudentCreateOptions>(res)
  let regions = asNamedList<StudentNamedId>(data.regions)
  if (!regions.length) {
    try {
      regions = await fetchRegions()
    } catch {
      regions = []
    }
  }
  return {
    citizenships: asNamedList<StudentNamedId>(data.citizenships),
    social_statuses: asNamedList<StudentNamedId>(data.social_statuses),
    edu_types: asNamedList<StudentEduType>(data.edu_types),
    regions,
    pay_type: asNamedList<StudentNamedId>(data.pay_type),
  }
}

export async function fetchRegions(): Promise<StudentNamedId[]> {
  const res = await apiClient.get<Record<string, unknown>>(withAccessToken('/region'))
  return asNamedList<StudentNamedId>(unwrapEntity(res))
}

export async function fetchDistricts(regionId: string): Promise<StudentNamedId[]> {
  if (!regionId) return []
  const res = await apiClient.get<Record<string, unknown>>(
    withAccessToken(`/area?region_id=${encodeURIComponent(regionId)}`),
  )
  const data = unwrapEntity<Record<string, unknown>>(res)
  return asNamedList<StudentNamedId>(data.data ?? data)
}

function assertStudentSaved(res: { status?: number | boolean; message?: string }) {
  if (res.status === 2 || res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Validation error')
  }
}

/** POST v2 /students/:id (FormData) */
export async function updateStudent(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/students/${id}`, formData)
  assertStudentSaved(res)
  return res
}

/** GET v2 /students/get-student-counts */
export async function fetchStudentCounts(): Promise<StudentCounts> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: StudentCounts
    message?: string
  }>('/students/get-student-counts')
  assertOk(res)
  return res.data ?? {}
}

/** POST v1 /student-delete */
export async function deleteStudent(id: number) {
  const form = new FormData()
  form.append('student_id', String(id))
  const res = await apiClient.postForm<{
    status?: number | boolean
    message?: string
  }>(withAccessToken('/student-delete'), form)
  if (res.status === 0 || res.status === false || res.status === 2) {
    throw new Error(res.message || 'Request failed')
  }
  return res
}

/** GET v2 /student-certificates/index */
export async function fetchStudentCertificates(filters: StudentCertificateFilters) {
  const items: FilterItem[] = []
  pushLike(items, 'student.last_name', filters.lastName, false)
  pushLike(items, 'student.first_name', filters.firstName, false)
  pushLike(items, 'student.middle_name', filters.middleName, false)
  pushLike(items, 'student.passport_jshir', filters.passportJshir, false)
  pushLike(items, 'certificate_serial', filters.certificateSerial, false)
  pushLike(items, 'certificate_number', filters.certificateNumber, false)
  pushLike(items, 'group.name_uz', filters.groupName, false)

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
  })
  const rel = relationsQuery(['student', 'final_mark', 'organization', 'group'])
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-certificates/index?${query}&${rel}`,
  )
  assertOk(res)
  return unwrapPage<StudentCertificateItem>(res, filters.page, filters.showCount)
}

/** GET v2 /student-certificates/students-without-certificates */
export async function fetchStudentsWithoutCertificates(
  filters: StudentWithoutCertificateFilters,
) {
  const items: FilterItem[] = []
  pushLike(items, 'last_name', filters.lastName, false)
  pushLike(items, 'first_name', filters.firstName, false)
  pushLike(items, 'middle_name', filters.middleName, false)
  pushLike(items, 'passport_jshir', filters.passportJshir, false)
  pushLike(items, 'organization.name_uz', filters.organizationName, false)

  const query = buildListQuery({
    page: filters.page,
    show_count: filters.showCount,
    filters: items,
  })
  const rel = relationsQuery([
    'final_mark',
    'organization',
    'grouped_student.group',
    'organization_final_exam_student_result',
    'student_personal_attendance',
  ])
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-certificates/students-without-certificates?${query}&${rel}`,
  )
  assertOk(res)
  return unwrapPage<StudentItem>(res, filters.page, filters.showCount)
}

function unwrapStatus<T extends object>(payload: unknown, markers: (keyof T)[]): T {
  const entity = unwrapEntity<T>(payload)
  if (markers.some((key) => entity?.[key] != null)) return entity
  const body = (payload ?? {}) as Record<string, unknown>
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    return body.data as T
  }
  return entity
}

function cameraStatus(payload: unknown): SchoolCameraStatus {
  return unwrapStatus<SchoolCameraStatus>(payload, [
    'pending',
    'organization_has_camera',
    'has_image',
  ])
}

/** GET v2 /students/:id/camera/status */
export async function fetchStudentCameraStatus(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/students/${id}/camera/status`)
  return cameraStatus(res)
}

/** GET v2 /students/:id/autodrome/status */
export async function fetchStudentAutodromeStatus(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/students/${id}/autodrome/status`)
  return unwrapStatus<AutodromeCameraStatus>(res, ['autodrome', 'aos', 'reason'])
}

/** POST v2 /students/:id/camera/enroll */
export async function enrollStudentCamera(id: string) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/students/${id}/camera/enroll`,
    {},
  )
  assertOk(res)
  return res
}

/** POST v2 /students/:id/camera/replace-image */
export async function replaceStudentCameraImage(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{ status?: number | boolean; message?: string }>(
    `/students/${id}/camera/replace-image`,
    formData,
  )
  assertOk(res)
  return res
}

/** GET v2 /students/:id/camera/check-bionet */
export async function checkStudentBionet(id: string) {
  const res = await apiClientV2.get<unknown>(`/students/${id}/camera/check-bionet`)
  assertOk(res as { status?: number | boolean; message?: string })
  return unwrapEntity<Record<string, unknown>>(res)
}

/** DELETE v2 /students/:id/camera/image */
export async function deleteStudentCameraImage(id: string) {
  const res = await apiClientV2.delete<{ status?: number | boolean; message?: string }>(
    `/students/${id}/camera/image`,
  )
  assertOk(res)
  return res
}

/** DELETE v2 /students/:id/camera/main-image */
export async function deleteStudentMainImage(id: string) {
  const res = await apiClientV2.delete<{ status?: number | boolean; message?: string }>(
    `/students/${id}/camera/main-image`,
  )
  assertOk(res)
  return res
}

/** POST v2 /students/:id/autodrome/:aosId/resend */
export async function resendAutodromeStudent(id: string, aosId: number) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/students/${id}/autodrome/${aosId}/resend`,
    {},
  )
  assertOk(res)
  return res
}

/** POST v2 /students/:id/autodrome/face-extension — rasmini yana 6 kun faol qiladi */
export async function grantAutodromeCameraDays(id: string) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/students/${id}/autodrome/face-extension`,
    {},
  )
  assertOk(res)
  return res
}

/** POST v2 /students/:id/autodrome/:aosId/replace-image */
export async function replaceAutodromeImage(
  id: string,
  aosId: number,
  formData: FormData,
) {
  const res = await apiClientV2.postForm<{ status?: number | boolean; message?: string }>(
    `/students/${id}/autodrome/${aosId}/replace-image`,
    formData,
  )
  assertOk(res)
  return res
}

/** GET v2 /student-personal-attendance/get-student-attendance/:id */
export async function fetchStudentAttendanceLog(id: string, showCount = 10, page = 1) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-personal-attendance/get-student-attendance/${id}?show_count=${showCount}&page=${page}`,
  )
  return unwrapPage<StudentAttendanceLog>(res, page, showCount)
}

/** GET v2 /student-personal-attendance/by-autodrome/:id */
export async function fetchStudentAutodromeAttendance(
  id: string,
  showCount = 10,
  page = 1,
) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-personal-attendance/by-autodrome/${id}?show_count=${showCount}&page=${page}`,
  )
  const result = unwrapPage<StudentAttendanceLog>(res, page, showCount)
  const body = res as Record<string, unknown>
  const nested =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : body
  const summary = (nested.summary ?? body.summary) as AutodromeAttendanceSummary | undefined
  return { ...result, summary }
}

function asResponseList<T extends { id?: number | string }>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const body = (payload ?? {}) as Record<string, unknown>
  if (Array.isArray(body.data)) return body.data as T[]
  return asNamedList<T>(body.data ?? payload)
}

/** GET v2 /get-student-payments/:id */
export async function fetchStudentPayments(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(`/get-student-payments/${id}`)
  return asResponseList<StudentPaymentItem>(res)
}

/** GET v2 /student-exam-results */
export async function fetchStudentExamResults(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-exam-results?student_id=${encodeURIComponent(id)}`,
  )
  return asResponseList<StudentExamResultItem>(res)
}

/** GET v2 /get-student-shartnoma-info */
export async function fetchStudentContract(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/get-student-shartnoma-info?student_id=${encodeURIComponent(id)}`,
  )
  const body = res as Record<string, unknown>
  if (body.edu_type_price) return body as StudentContractInfo
  return unwrapEntity<StudentContractInfo>(res)
}

/** GET v2 /students/:id/exam-center-student-results */
export async function fetchExamCenterResults(
  id: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const params = new URLSearchParams()
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)
  const qs = params.toString()
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/students/${id}/exam-center-student-results${qs ? `?${qs}` : ''}`,
  )
  return asResponseList<ExamCenterResultItem>(res)
}

/** POST v2 /student-personal-attendance/update/:id */
export async function refreshStudentAttendanceStats(id: string) {
  const res = await apiClientV2.post<Record<string, unknown>>(
    `/student-personal-attendance/update/${id}`,
    { relations: ['student_personal_attendance'] },
  )
  assertOk(res)
  return res
}

/** POST v2 /students/:id/sync-camera-attendance */
export async function syncStudentCameraAttendance(id: string) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/students/${id}/sync-camera-attendance`,
    {},
  )
  assertOk(res)
  return res
}

export type ExtraLessonsStorePayload = {
  student_ids: number[]
  group_id: number
  lesson_dates: string[]
  start_time: string
  end_time: string
  note?: string
}

/** POST v2 /extra-lessons/store */
export async function storeExtraLessons(payload: ExtraLessonsStorePayload) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    '/extra-lessons/store',
    payload,
  )
  assertOk(res)
  return res
}

/** DELETE v2 /extra-lessons/delete/:id */
export async function deleteExtraLesson(id: number | string) {
  const res = await apiClientV2.delete<{ status?: number | boolean; message?: string }>(
    `/extra-lessons/delete/${id}`,
  )
  assertOk(res)
  return res
}

/** POST v2 /extra-lessons/toggle-attendance/:id */
export async function toggleExtraLessonAttendance(id: number | string) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/extra-lessons/toggle-attendance/${id}`,
    {},
  )
  assertOk(res)
  return res
}

/** GET v2 /students/:id/practical-attendances */
export async function fetchPracticalAttendances(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/students/${id}/practical-attendances`,
  )
  assertOk(res)
  return asResponseList<PracticalAttendanceItem>(res)
}

/** GET v2 /students/:id/class-dates */
export async function fetchStudentClassDates(
  id: string,
  fromDate?: string,
  toDate?: string,
): Promise<StudentClassDatesPayload> {
  const params = new URLSearchParams()
  if (fromDate) params.set('from_date', fromDate)
  if (toDate) params.set('to_date', toDate)
  const qs = params.toString()
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/students/${id}/class-dates${qs ? `?${qs}` : ''}`,
  )
  const body = (res ?? {}) as Record<string, unknown>
  const nested =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : body
  const list = Array.isArray(nested.data)
    ? (nested.data as StudentClassDateItem[])
    : Array.isArray(body.data)
      ? (body.data as StudentClassDateItem[])
      : []
  return {
    from_date: (nested.from_date ?? body.from_date) as string | null | undefined,
    to_date: (nested.to_date ?? body.to_date) as string | null | undefined,
    data: list,
  }
}

/** POST v2 /students/update-school-info/:id */
export async function updateStudentSchoolInfo(
  id: string,
  payload: StudentSchoolInfoPayload,
) {
  const res = await apiClientV2.post<Record<string, unknown>>(
    `/students/update-school-info/${id}`,
    payload,
  )
  assertOk(res)
  return unwrapEntity<StudentItem>(res)
}

export type StudentUserCredentials = {
  username?: string | null
  password?: string | null
}

export type ImageGateAdaptResult = {
  result?: string
  image_base64?: string
  message?: string
  reason?: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function nestedData(res: unknown): Record<string, unknown> {
  const body = asRecord(res)
  const nested = asRecord(body.data)
  return Object.keys(nested).length ? nested : body
}

/** POST v2 /students/update-additional-info/:id */
export async function updateStudentAdditionalInfo(
  id: string,
  payload: StudentAdditionalInfoPayload,
) {
  const res = await apiClientV2.post<Record<string, unknown>>(
    `/students/update-additional-info/${id}`,
    payload,
  )
  assertOk(res)
  return res
}

/** POST v2 /student/manual-change-image/:id */
export async function changeStudentImageManual(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/student/manual-change-image/${id}`, formData)
  assertOk(res)
  return res
}

/** POST v2 /student/manual-change-exam-image/:id */
export async function changeExamImageManual(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/student/manual-change-exam-image/${id}`, formData)
  assertOk(res)
  return res
}

/** POST v2 /students/sync-image/:id — MSPD dan rasm */
export async function syncStudentImage(
  id: string,
  payload: {
    passport_seria?: string | null
    passport_number?: string | null
    birthday?: string | null
  },
) {
  return apiClientV2.post<{
    status?: number | boolean
    message?: string
    data?: { status?: number | boolean; message?: string }
  }>(`/students/sync-image/${id}`, payload)
}

function asImageGateResult(res: unknown): ImageGateAdaptResult {
  const nested = nestedData(res)
  const body = asRecord(res)
  return {
    result: String(nested.result ?? body.result ?? ''),
    image_base64: String(nested.image_base64 ?? body.image_base64 ?? ''),
    message: String(nested.message ?? body.message ?? ''),
    reason: String(nested.reason ?? body.reason ?? ''),
  }
}

/** POST v2 /image-gate/process — kesilgan rasmni turniket uchun moslash */
export async function adaptImageForTurnstile(
  formData: FormData,
): Promise<ImageGateAdaptResult> {
  try {
    const res = await apiClientV2.postForm<unknown>('/image-gate/process', formData)
    return asImageGateResult(res)
  } catch {
    return { result: 'service_unavailable' }
  }
}

/** POST v2 /students/:id/image-gate/adapt-current */
export async function adaptCurrentStudentImage(
  id: string,
): Promise<ImageGateAdaptResult> {
  const res = await apiClientV2.post<unknown>(
    `/students/${id}/image-gate/adapt-current`,
  )
  return asImageGateResult(res)
}

/** POST v1 /password-show?user_id= */
export async function fetchUserPassword(
  userId: string,
): Promise<StudentUserCredentials> {
  const res = await apiClient.post<unknown>(
    withAccessToken(`/password-show?user_id=${encodeURIComponent(userId)}`),
  )
  const body = asRecord(res)
  if (body.status === 0 || body.status === false) {
    throw new Error(String(body.message || 'Request failed'))
  }
  const nested = nestedData(res)
  return {
    username: (nested.username ?? body.username) as string | null | undefined,
    password: (nested.password ?? body.password) as string | null | undefined,
  }
}

/** POST v2 /users/regenerate-credentials */
export async function regenerateUserCredentials(payload: {
  user_id: number | string | null
  profession_id: number | string | null
  profession_type: string | null
}): Promise<StudentUserCredentials> {
  const res = await apiClientV2.post<unknown>(
    '/users/regenerate-credentials',
    payload,
  )
  const body = asRecord(res)
  if (body.status === 0 || body.status === false) {
    throw new Error(String(body.message || 'Request failed'))
  }
  const nested = nestedData(res)
  return {
    username: (nested.username ?? body.username) as string | null | undefined,
    password: (nested.password ?? body.password) as string | null | undefined,
  }
}
