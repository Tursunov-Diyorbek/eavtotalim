import { apiClientV2 } from './client'
import { assertOk, unwrapEntity, unwrapPage } from '@/lib/apiPage'
import type {
  AutodromeAgreementRow,
  AutodromePickItem,
} from '@/types/autodrome-agreement'
import type { AutodromeCameraItem } from '@/types/autodrome-camera'

type Envelope = {
  response_code?: number
  status?: number | boolean
  message?: string
  data?: unknown
}

function assertAgreementOk(res: Envelope) {
  if (res.response_code === 403) {
    const extra = typeof res.data === 'string' ? res.data : res.message
    throw new Error(extra || 'Forbidden')
  }
  if (res.response_code != null && res.response_code !== 200) {
    throw new Error(res.message || 'Request failed')
  }
  assertOk(res)
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    sp.set(key, String(value))
  }
  const query = sp.toString()
  return query ? `?${query}` : ''
}

/** GET v2 `/autodrome-agreements/index-agreements` */
export async function fetchAutodromeAgreements() {
  const res = await apiClientV2.get<Envelope>(
    '/autodrome-agreements/index-agreements?show_count=500',
  )
  assertAgreementOk(res)
  const page = unwrapPage<AutodromeAgreementRow>(res, 1, 500)
  return page.data
}

/** GET v2 `/autodrome-agreements/show-agreement/:id` */
export async function fetchAutodromeAgreement(id: string) {
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-agreements/show-agreement/${id}`,
  )
  assertAgreementOk(res)
  return unwrapEntity<AutodromeAgreementRow>(res)
}

/** GET v2 `/autodrome-agreements/get-autodromes` */
export async function fetchAgreementAutodromes() {
  const res = await apiClientV2.get<Envelope>(
    '/autodrome-agreements/get-autodromes?show_count=all',
  )
  assertAgreementOk(res)
  return unwrapPage<AutodromePickItem>(res, 1, 500).data
}

export type AgreementCameraFilters = {
  status?: string
  search?: string
}

/** GET v2 `/autodrome-agreements/cameras/:autodromeId` */
export async function fetchAgreementCameras(
  autodromeId: number,
  filters: AgreementCameraFilters = {},
) {
  const res = await apiClientV2.get<Envelope>(
    `/autodrome-agreements/cameras/${autodromeId}${qs({
      show_count: 200,
      status: filters.status,
      search: filters.search,
    })}`,
  )
  if (res.status === 0 || res.status === false) {
    throw new Error(res.message || 'Kameralar holatini olishda xatolik')
  }
  return unwrapPage<AutodromeCameraItem>(res, 1, 200).data
}

/** POST v2 `/autodrome-agreements/send-agreement` */
export async function sendAutodromeAgreement(formData: FormData) {
  const res = await apiClientV2.postForm<Envelope>(
    '/autodrome-agreements/send-agreement',
    formData,
  )
  assertAgreementOk(res)
  return res
}

/** DELETE v2 `/autodrome-agreements/delete-agreement/:id` */
export async function deleteAutodromeAgreement(id: number) {
  const res = await apiClientV2.delete<Envelope>(
    `/autodrome-agreements/delete-agreement/${id}`,
  )
  assertAgreementOk(res)
  return res
}

/** POST v2 `/autodrome-agreements/change-temporary-status-from-organization/:id` */
export async function changeAgreementTemporaryStatus(id: number) {
  const res = await apiClientV2.post<Envelope>(
    `/autodrome-agreements/change-temporary-status-from-organization/${id}`,
  )
  assertAgreementOk(res)
  return res
}

/** POST v2 `/autodrome-agreements/cancel-agreement-from-organization/:id` */
export async function cancelAutodromeAgreement(id: number) {
  const res = await apiClientV2.post<Envelope>(
    `/autodrome-agreements/cancel-agreement-from-organization/${id}`,
  )
  assertAgreementOk(res)
  return res
}
