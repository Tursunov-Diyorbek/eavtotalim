import type { AutodromeAgreementRow } from '@/types/autodrome-agreement'

export const CONTRACT_STATUSES = [
  { id: '1', labelKey: 'autodromeContractsPage.statusNew' },
  { id: '2', labelKey: 'autodromeContractsPage.statusApproved' },
  { id: '3', labelKey: 'autodromeContractsPage.statusRejected' },
  { id: '4', labelKey: 'autodromeContractsPage.statusExpired' },
  { id: '8', labelKey: 'autodromeContractsPage.statusSchoolRejected' },
] as const

export function contractStatusId(row: Pick<AutodromeAgreementRow, 'organization_autodrome_agreement_status'>) {
  return Number(row.organization_autodrome_agreement_status?.id)
}

export function contractStatusTone(id: number): 'amber' | 'teal' | 'rose' {
  if (id === 2) return 'teal'
  if (id === 3 || id === 8) return 'rose'
  return 'amber'
}

export function contractIsVip(value: unknown) {
  return value === true || value === 1 || value === '1'
}
