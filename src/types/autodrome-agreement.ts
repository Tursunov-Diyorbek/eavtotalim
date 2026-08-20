export type AutodromeAgreementStatus = {
  id?: number
  title?: string | null
}

export type AutodromeAgreementNamed = {
  id?: number
  name?: string | null
  inn?: string | null
}

export type AutodromeAgreementPlace = AutodromeAgreementNamed & {
  name_uz?: string | null
}

export type AutodromeAgreementOrg = AutodromeAgreementNamed & {
  logo_image?: string | null
  address?: string | null
}

export type AutodromeAgreementAutodrome = AutodromeAgreementNamed & {
  autodrome_status?: AutodromeAgreementStatus | null
  contact_phone?: string | null
  director_phone?: string | null
  director?: { fio?: string | null } | null
  region?: AutodromeAgreementPlace | null
  area?: AutodromeAgreementPlace | null
  field_size?: string | number | null
  address?: string | null
  landmark?: string | null
  created_at?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  count_active_groups?: {
    a?: number | string | null
    b?: number | string | null
    e?: number | string | null
  } | null
}

export type AutodromeAgreementRow = {
  id: number
  file?: string | null
  start_date?: string | null
  end_date?: string | null
  is_vip?: number | boolean | null
  autodrome?: AutodromeAgreementAutodrome | null
  organization?: AutodromeAgreementOrg | null
  organization_autodrome_agreement_status?: AutodromeAgreementStatus | null
}

export type AutodromePickItem = AutodromeAgreementAutodrome & {
  autodrome_status?: AutodromeAgreementStatus | null
}
