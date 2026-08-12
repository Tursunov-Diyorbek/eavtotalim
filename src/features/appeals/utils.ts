import type { BadgeTone } from '@/components/ui'
import type { AppealStatus } from '@/types'
import { pickLocalized } from '@/features/lessons'

export { pickLocalized as pickAppealTypeName }

export function isClosedFlag(value: boolean | number | null | undefined) {
  return value === true || value === 1
}

export function appealStatusMeta(
  status: AppealStatus | null | undefined,
  t: (key: string) => string,
): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'new':
      return { label: t('appeal.statusNew'), tone: 'teal' }
    case 'in_progress':
      return { label: t('appeal.statusInProgress'), tone: 'amber' }
    case 'resolved':
      return { label: t('appeal.statusResolved'), tone: 'signal' }
    case 'rejected':
      return { label: t('appeal.statusRejected'), tone: 'rose' }
    case 'answered':
      return { label: t('appeal.statusAnswered'), tone: 'indigo' }
    default:
      return {
        label: status ? String(status) : t('appeal.statusAnswered'),
        tone: 'indigo',
      }
  }
}
