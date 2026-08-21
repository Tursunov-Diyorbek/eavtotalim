export type PaymentHistoryItem = {
  id: number
  amount?: number | string | null
  payment_date?: string | null
  created_at?: string | null
  pay_type?: { id?: number; name?: string | null } | null
  student?: {
    id?: number
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  group?: {
    id?: number
    name?: string | null
    name_uz?: string | null
  } | null
}

export type PaymentHistoryPageData = {
  data: PaymentHistoryItem[]
  total_items: number
  last_page: number
}

export type PaymentGroupStudent = {
  id: number
  last_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  payment?: number | string | null
}

export type PaymentGroupOption = {
  id: number
  name?: string | null
  name_uz?: string | null
  edu_status?: number | string | null
  education_price?: number | string | null
  students?: PaymentGroupStudent[] | null
}

export type OrgReportRow = {
  id: number
  name_uz?: string | null
  last_year_payments?: number | string | null
  this_year_payments?: number | string | null
  all_payments?: number | string | null
  returned_payments?: number | string | null
  debt?: number | string | null
  price?: number | string | null
  all_need_payment?: number | string | null
  month_payments?: Array<{ amount?: number | string | null }> | null
}

export type GroupReportRow = {
  id: number
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  name_en?: string | null
  all_need_payment?: number | string | null
  sum_amount?: number | string | null
  returned_pays?: number | string | null
  debt?: number | string | null
  overpayment?: number | string | null
  status?: number | null
}

export type StudentPaymentListRow = {
  id: number
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
  amount?: number | string | null
  last_payment?: { payment_date?: string | null } | null
  mygroup?: Array<{ id?: number; name_uz?: string | null }> | null
}

export type YearReportPayType = { id: number; name?: string | null }

export type YearReportRow = {
  id: number
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  name_en?: string | null
  edu_type?: { short_name_en?: string | null } | null
  students_count?: number | null
  education_price?: number | string | null
  all_need_amount?: number | string | null
  all_amount_by_paytype?: Record<string, number | string | null> | null
  returned_payment?: number | string | null
  debt?: number | string | null
  teacher?: string | null
}

export type YearReportPageData = {
  data: YearReportRow[]
  total_items: number
  last_page: number
  payTypes: YearReportPayType[]
}

export type PaymentCreateStudent = {
  id: number
  first_name?: string | null
  last_name?: string | null
  middle_name?: string | null
}

export type PaymentCreatePageData = {
  students: PaymentCreateStudent[]
  total_items: number
  last_page: number
  groups: Array<{ id: number | string; name_uz?: string | null; name?: string | null }>
  years: Array<string | number>
}

export type StudentPaymentRecord = {
  id: number
  amount?: number | string | null
  payment_date?: string | null
  pay_type_id?: number | null
  description?: string | null
}

export type StudentForPayment = {
  student?: {
    id?: number
    first_name?: string | null
    last_name?: string | null
    middle_name?: string | null
    image?: string | null
    gender?: string | number | null
    group?: { id?: number; name_uz?: string | null } | null
    edu_type?: { name_uz?: string | null } | null
    payments?: StudentPaymentRecord[] | null
  } | null
  payments_sum?: number | string | null
  debt?: number | string | null
  pay_type?: YearReportPayType[] | null
}

export type PaymentCheckItem = {
  id: number
  amount?: number | string | null
  payment_date?: string | null
  organization?: { name?: string | null } | null
  group?: { name?: string | null; name_uz?: string | null } | null
  student?: {
    last_name?: string | null
    first_name?: string | null
    middle_name?: string | null
  } | null
  pay_type?: { id?: number; name?: string | null } | null
}

export type CreatePaymentHistoryPayload = {
  group_id: number
  student_id: number
  amount: string
  payment_date: string
  pay_type_id: number
}
