import { apiClientV2 } from './client'
import { assertOk, buildListQuery, unwrapPage, type FilterItem } from '@/lib/apiPage'
import type {
  ContentGroupRow,
  ContentStudentRow,
  ContentStudentTopicRow,
  TemplateStatRow,
  TemplateTestResultRow,
} from '@/types/director-stats'

export async function fetchTemplateTestStats(args: {
  page: number
  showCount: number
  studentSearch?: string
  groupSearch?: string
}) {
  const extra: Record<string, string> = {}
  if (args.studentSearch?.trim()) extra.student_search = args.studentSearch.trim()
  if (args.groupSearch?.trim()) extra.group_search = args.groupSearch.trim()
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    extra,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-reports/template-tests?${query}`,
  )
  assertOk(res)
  return unwrapPage<TemplateStatRow>(res, args.page, args.showCount)
}

export async function fetchTemplateTestStudentResults(
  studentId: string,
): Promise<TemplateTestResultRow[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/student-reports/template-tests/${encodeURIComponent(studentId)}`,
  )
  assertOk(res)
  if (Array.isArray(res.data)) return res.data as TemplateTestResultRow[]
  return unwrapPage<TemplateTestResultRow>(res).data
}

export async function fetchContentViewGroups(args: {
  page: number
  showCount: number
  eduStatus: string
}) {
  const filters: FilterItem[] = []
  if (args.eduStatus !== '') {
    filters.push({
      fieldKey: 'edu_status',
      fieldOperator: '=',
      fieldValue: args.eduStatus,
    })
  }
  const query = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/topic-action-statistic/groups?${query}`,
  )
  assertOk(res)
  return unwrapPage<ContentGroupRow>(res, args.page, args.showCount)
}

export async function fetchContentViewStudents(args: {
  groupId: string
  showCount?: number
}) {
  const query = buildListQuery({
    extra: {
      group_id: args.groupId,
      show_count: args.showCount ?? 100,
    },
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/topic-action-statistic/students?${query}`,
  )
  assertOk(res)
  return unwrapPage<ContentStudentRow>(res, 1, args.showCount ?? 100)
}

export async function fetchContentViewStudentTopics(
  studentId: string,
): Promise<ContentStudentTopicRow[]> {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/topic-action-statistic/students/${encodeURIComponent(studentId)}`,
  )
  assertOk(res)
  if (Array.isArray(res.data)) return res.data as ContentStudentTopicRow[]
  return unwrapPage<ContentStudentTopicRow>(res).data
}
