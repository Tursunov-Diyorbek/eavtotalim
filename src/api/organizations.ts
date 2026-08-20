import { apiClientV2 } from './client'
import { assertOk, unwrapPage } from '@/lib/apiPage'
import type { OrganizationListItem } from '@/types/organization'

/** Eski `getOrganizationsIndex` — `GET v2 /organizations/list`. */
export async function fetchOrganizationsList(search = '') {
  const sp = new URLSearchParams()
  sp.set('limit', '10')
  const q = search.trim()
  if (q) sp.set('organization_search', q)
  const res = await apiClientV2.get<Record<string, unknown>>(
    `/organizations/list?${sp}`,
  )
  assertOk(res)
  return unwrapPage<OrganizationListItem>(res, 1, 10).data
}
