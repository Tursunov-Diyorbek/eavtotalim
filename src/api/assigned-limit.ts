import { apiClientV2 } from './client'
import { assertOk } from '@/lib/apiPage'
import type { AssignedLimitOverview } from '@/types/assigned-limit'

/** GET v2 /superior-organization-limits/organization-overview */
export async function fetchAssignedLimitOverview(
  organizationId: string,
  asDirector: boolean,
): Promise<AssignedLimitOverview> {
  const query = asDirector
    ? ''
    : `?organization_id=${encodeURIComponent(organizationId)}`
  const res = await apiClientV2.get<{
    status?: number | boolean
    data?: AssignedLimitOverview
    message?: string
  }>(`/superior-organization-limits/organization-overview${query}`)
  assertOk(res)
  return res.data ?? {}
}
