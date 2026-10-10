import { assertOk, buildListQuery, unwrapEntity, unwrapPage } from '@/lib/apiPage'
import { apiClientV2 } from './client'

export type MentorStats = {
  total_mentees_count?: number
  groups_count?: number
  low_attendance_count?: number
}

export type MentorGroupOption = {
  id: number
  name: string
}

export type MentorSessionStat = {
  attended_count?: number | null
  hours?: number | null
  minutes?: number | null
}

export type MentorStudent = {
  id: number
  last_name?: string | null
  first_name?: string | null
  full_name?: string | null
  phone?: string | null
  image?: string | null
  group?: { id?: number | null; name?: string | null; name_uz?: string | null } | null
  mygroup?: { id?: number | null; name?: string | null; name_uz?: string | null } | null
  attendance?: {
    percent?: number | null
    attended_lessons?: number | null
    total_lessons?: number | null
  } | null
  practical?: MentorSessionStat | null
  autodrome?: MentorSessionStat | null
  tests?: {
    templates_count_done?: number | null
    average_corrects?: number | null
  } | null
  last_seen?: string | null
}

export type MentorStudentsArgs = {
  page: number
  showCount: number
  word?: string
  groupId?: string
  attendance?: string
}

function isPhoneQuery(word: string) {
  const compact = word.replace(/[\s()+-]/g, '')
  const digits = compact.replace(/\D/g, '')
  return digits.length >= 5 && digits.length === compact.length
}

function phoneSearchValue(word: string) {
  const digits = word.replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length >= 12) return digits.slice(-9)
  return digits
}

function filtersOf(args: MentorStudentsArgs) {
  const filters: { fieldKey: string; fieldOperator: string; fieldValue: string | number }[] = []
  const word = args.word?.trim() ?? ''
  if (word) {
    if (isPhoneQuery(word)) {
      filters.push({
        fieldKey: 'phone1',
        fieldOperator: 'LIKE',
        fieldValue: phoneSearchValue(word),
      })
    } else {
      const parts = word.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) {
        filters.push(
          { fieldKey: 'last_name', fieldOperator: 'LIKE', fieldValue: parts[0] },
          {
            fieldKey: 'first_name',
            fieldOperator: 'LIKE',
            fieldValue: parts.slice(1).join(' '),
          },
        )
      } else {
        filters.push({ fieldKey: 'first_name', fieldOperator: 'LIKE', fieldValue: word })
      }
    }
  }
  if (args.groupId) {
    filters.push({
      fieldKey: 'mygroup.id',
      fieldOperator: '=',
      fieldValue: args.groupId,
    })
  }
  if (args.attendance === 'low' || args.attendance === 'good') {
    filters.push({
      fieldKey: 'student_personal_attendance.average_attendance_percent',
      fieldOperator: args.attendance === 'low' ? '<' : '>=',
      fieldValue: 80,
    })
  }
  return filters
}

function mapGroups(payload: unknown): MentorGroupOption[] {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  const raw =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>).groups
      : undefined
  if (!Array.isArray(raw)) return []
  return raw
    .map((group) => {
      const row = group as Record<string, unknown>
      const id = Number(row.id)
      const name = String(row.name_uz || row.short_name_uz || row.name || '').trim()
      return { id, name }
    })
    .filter((group) => Number.isFinite(group.id) && group.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'uz'))
}

export async function fetchMentorStats() {
  const res = await apiClientV2.get<Record<string, unknown>>('/mentor/dashboard-stats')
  assertOk(res)
  return unwrapEntity<MentorStats>(res)
}

export async function fetchMentorStudents(args: MentorStudentsArgs) {
  const qs = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters: filtersOf(args),
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/mentor/my-students${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return {
    ...unwrapPage<MentorStudent>(res, args.page, args.showCount),
    groups: mapGroups(res),
  }
}

export type ActiveMentor = {
  id: number
  name: string
}

export function mentorDisplayName(mentor: unknown): string {
  if (!mentor || typeof mentor !== 'object') return ''
  const row = mentor as Record<string, unknown>
  if (typeof row.full_name === 'string' && row.full_name.trim()) return row.full_name.trim()
  if (typeof row.fio === 'string' && row.fio.trim()) return row.fio.trim()
  if (typeof row.name === 'string' && row.name.trim()) return row.name.trim()
  if (row.name && typeof row.name === 'object') {
    const name = row.name as Record<string, unknown>
    const text = name.uz || name.ru || name.kiril
    if (typeof text === 'string' && text.trim()) return text.trim()
  }
  return [row.last_name, row.first_name, row.middle_name]
    .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    .join(' ')
}

function mentorListFrom(payload: unknown): ActiveMentor[] {
  const body = (payload ?? {}) as Record<string, unknown>
  const nested = body.data
  const inner =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : null
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(nested)
      ? nested
      : Array.isArray(inner?.data)
        ? inner.data
        : Array.isArray(body.items)
          ? body.items
          : []

  return list
    .map((item) => {
      const row = item as Record<string, unknown>
      const source =
        row.user && typeof row.user === 'object'
          ? (row.user as Record<string, unknown>)
          : row.mentor && typeof row.mentor === 'object'
            ? (row.mentor as Record<string, unknown>)
            : row
      const id = Number(row.id ?? row.mentor_id ?? source.id)
      const name = mentorDisplayName(source) || mentorDisplayName(row)
      return { id, name }
    })
    .filter((item) => Number.isFinite(item.id) && item.name)
}

/** GET v2 /mentor/active-mentors */
export async function fetchActiveMentors() {
  const res = await apiClientV2.get<Record<string, unknown>>('/mentor/active-mentors')
  assertOk(res)
  return mentorListFrom(res)
}

/** POST v2 /mentor/assign-student/:id */
export async function assignStudentMentor(studentId: number | string, mentorId: number) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/mentor/assign-student/${studentId}`,
    { mentor_id: mentorId },
  )
  assertOk(res)
  return res
}

/** POST v2 /mentor/assign-group/:id */
export async function assignGroupMentor(groupId: number | string, mentorId: number) {
  const res = await apiClientV2.post<{ status?: number | boolean; message?: string }>(
    `/mentor/assign-group/${groupId}`,
    { mentor_id: mentorId },
  )
  assertOk(res)
  return res
}

/** Guruh filtri — ro‘yxat javobidagi `groups`, faqat dropdown ochilganda. */
export async function fetchMentorStudentGroups() {
  const qs = buildListQuery({ page: 1, show_count: 1 })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/mentor/my-students?${qs}`,
  )
  assertOk(res)
  return mapGroups(res)
}
