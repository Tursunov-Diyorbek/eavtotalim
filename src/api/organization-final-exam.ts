import { apiClientV2 } from './client'
import { asNamedList, assertOk, unwrapPage } from '@/lib/apiPage'
import type {
  OrganizationFinalExamPayload,
  OrganizationFinalExamRow,
} from '@/types/organization-final-exam'

/** GET v2 `/organization-final-exam/index` */
export async function fetchOrganizationFinalExams() {
  const res = await apiClientV2.get<Record<string, unknown>>(
    '/organization-final-exam/index',
  )
  assertOk(res)
  const page = unwrapPage<OrganizationFinalExamRow>(res, 1, 500)
  if (page.data.length) return page.data
  return asNamedList<OrganizationFinalExamRow>(res)
}

/** POST v2 `/organization-final-exam/create` */
export async function createOrganizationFinalExam(
  payload: OrganizationFinalExamPayload,
) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
    success?: boolean
    response_code?: number
  }>('/organization-final-exam/create', payload)
  assertOk(res)
  return res
}

/** PUT v2 `/organization-final-exam/update/:id` */
export async function updateOrganizationFinalExam(
  examId: number,
  payload: Pick<OrganizationFinalExamPayload, 'time'>,
) {
  const res = await apiClientV2.put<{
    status?: number | boolean
    message?: string
  }>(`/organization-final-exam/update/${examId}`, payload)
  assertOk(res)
  return res
}

/** POST v2 `/organization-final-exam/activate/:id` */
export async function activateOrganizationFinalExam(examId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/organization-final-exam/activate/${examId}`)
  assertOk(res)
  return res
}

/** POST v2 `/organization-final-exam/dis-activate/:id` */
export async function deactivateOrganizationFinalExam(examId: number) {
  const res = await apiClientV2.post<{
    status?: number | boolean
    message?: string
  }>(`/organization-final-exam/dis-activate/${examId}`)
  assertOk(res)
  return res
}
