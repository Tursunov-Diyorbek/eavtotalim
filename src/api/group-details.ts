import { apiClientV2 } from './client'
import type { GroupDetailsData } from '@/types'

/** Guruh tafsilotlari — GET /students/:professionId/group-details */
export async function fetchGroupDetails(
  professionId: number,
): Promise<GroupDetailsData> {
  const res = await apiClientV2.get<{
    status?: number | boolean
    response_code?: number
    data?: GroupDetailsData
    message?: string
  }>(`/students/${professionId}/group-details`)

  const ok =
    res.status === 1 ||
    res.status === true ||
    res.response_code === 200

  if (!ok && res.status === 0) {
    throw new Error(res.message || 'Group details unavailable')
  }

  return {
    teachers: res.data?.teachers ?? [],
    cars: res.data?.cars ?? [],
  }
}
