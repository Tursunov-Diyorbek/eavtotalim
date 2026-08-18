import { assertOk, asNamedList, buildListQuery, unwrapEntity, unwrapPage } from '@/lib/apiPage'
import { apiClientV2 } from './client'

export type SituationLangBody = {
  lang?: string
  body?: string
}

export type ProblemSituationFile = {
  id?: number
  type?: string
  url?: string | null
}

export type ProblemSituationStatus = {
  id: number
  name?: string
}

export type ProblemSituationItem = {
  id: number
  edu_type_id?: number
  name?: Record<string, SituationLangBody>
  text?: Record<string, SituationLangBody>
  files?: ProblemSituationFile[]
  problematic_situation_status?: ProblemSituationStatus
  problematic_situation_status_id?: number
}

export async function fetchProblemSituations(args: {
  page: number
  showCount: number
  statusId?: string
}) {
  const qs = buildListQuery({
    page: args.page,
    show_count: args.showCount,
    filters: args.statusId
      ? [
          {
            fieldKey: 'problematic_situation_status_id',
            fieldOperator: '=',
            fieldValue: args.statusId,
          },
        ]
      : undefined,
  })
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/problematic-situations/teacher${qs ? `?${qs}` : ''}`,
  )
  assertOk(res)
  return unwrapPage<ProblemSituationItem>(res, args.page, args.showCount)
}

export async function fetchProblemSituationStatuses() {
  const res = await apiClientV2.get<unknown>(
    '/problematic-situations/teacher/statuses',
  )
  return asNamedList<ProblemSituationStatus>(unwrapEntity(res) ?? res)
}

export async function fetchProblemSituation(id: string) {
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/problematic-situations/teacher/${id}`,
  )
  assertOk(res)
  return unwrapEntity<ProblemSituationItem>(res)
}

export async function createProblemSituation(formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>('/problematic-situations/teacher', formData)
  assertOk(res)
  return res
}

export async function updateProblemSituation(id: string, formData: FormData) {
  const res = await apiClientV2.postForm<{
    status?: number | boolean
    message?: string
  }>(`/problematic-situations/teacher/${id}`, formData)
  assertOk(res)
  return res
}

export async function deleteProblemSituation(id: number) {
  const res = await apiClientV2.delete<{
    status?: number | boolean
    message?: string
  }>(`/problematic-situations/teacher/${id}`)
  assertOk(res)
  return res
}
