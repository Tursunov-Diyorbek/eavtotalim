import { HttpError } from '@/api'
import type { BadgeTone } from '@/components/ui'
import { formatPhoneLocal, parsePhoneDigits } from '@/lib/phone'

export function scheduleStatusTone(status: number | null | undefined): BadgeTone {
  if (status === 0) return 'amber'
  if (status === 1) return 'teal'
  return 'neutral'
}

export function notificationErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    const payload = err.payload
    if (payload && typeof payload === 'object') {
      const rec = payload as { errors?: Record<string, unknown>; message?: string }
      if (rec.errors && typeof rec.errors === 'object') {
        for (const val of Object.values(rec.errors)) {
          if (Array.isArray(val) && typeof val[0] === 'string') return val[0]
          if (typeof val === 'string') return val
        }
      }
      if (typeof rec.message === 'string' && rec.message) return rec.message
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function formatPhone1(phone: string | null | undefined): string {
  const digits = parsePhoneDigits(phone)
  if (!digits) return ''
  return `+998 ${formatPhoneLocal(digits)}`
}

export const TEMPLATE_KEYWORDS = [
  { token: '${last_name}', labelKey: 'notificationsPage.kwLastName' },
  { token: '${first_name}', labelKey: 'notificationsPage.kwFirstName' },
  { token: '${middle_name}', labelKey: 'notificationsPage.kwMiddleName' },
  { token: '${organization_name}', labelKey: 'notificationsPage.kwOrg' },
  { token: '${username}', labelKey: 'notificationsPage.kwLogin' },
  { token: '${password}', labelKey: 'notificationsPage.kwPassword' },
  { token: '${debt}', labelKey: 'notificationsPage.kwDebt' },
  { token: '${payment_sum}', labelKey: 'notificationsPage.kwPayments' },
] as const
