import { apiClientV2 } from './client'
import { assertOk } from '@/lib/apiPage'
import { isFilled } from '@/lib'

export type PublicOffer = {
  id: number
  title: string
  body: string
}

function asOffer(value: unknown): PublicOffer | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const rec = value as Record<string, unknown>
  const id = Number(rec.id)
  const title = isFilled(rec.title) ? String(rec.title) : ''
  const body = isFilled(rec.body) ? String(rec.body) : ''
  if (!Number.isFinite(id) || id <= 0) return null
  if (!title && !body) return null
  return { id, title, body }
}

/** `{ data }` qatlamlarini ochib, title/body bor ofertani oladi. */
function parseOffer(payload: unknown): PublicOffer | null {
  let cur: unknown = payload
  for (let depth = 0; depth < 4; depth += 1) {
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return null
    const rec = cur as Record<string, unknown>
    const inner = rec.data
    const nested = asOffer(inner)
    if (nested) return nested
    const direct = asOffer(rec)
    if (direct) return direct
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      cur = inner
      continue
    }
    return null
  }
  return null
}

/** Javob berilmagan oxirgi oferta. Yo‘q bo‘lsa `null`. */
export async function fetchLatestPublicOffer(): Promise<PublicOffer | null> {
  try {
    const res = await apiClientV2.get<unknown>('/public-offers/latest/active')
    return parseOffer(res)
  } catch {
    return null
  }
}

export async function acceptPublicOffer(
  id: number,
  organizationId: number | null,
): Promise<void> {
  const res = await apiClientV2.post<{
    status?: number | boolean | string
    message?: string
  }>(`/public-offers/${id}/accept`, { organization_id: organizationId })
  assertOk(res)
}
