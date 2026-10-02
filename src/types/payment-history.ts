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

export type PaymentShare = { count: number; percent: number; label: string }

/** `GET v2 /accounting-group-reports/index` — guruh bo‘yicha to‘lov taqsimoti. */
export type GroupShareRow = {
  id: number
  name: string
  students: number
  paid: PaymentShare
  partial: PaymentShare
  unpaid: PaymentShare
}

export type StudentPaymentStatus = 'paid' | 'partial' | 'debt' | 'unpaid' | ''

/** `GET v2 /accounting-payments/index` — o‘quvchi to‘lov holati. */
export type StudentPaymentListRow = {
  key: string
  studentId: number
  name: string
  group: string
  totalPrice: number
  debt: number
  paid: number
  bonus: number
  bonusNote: string
  date: string
  status: StudentPaymentStatus
  /** Backenddan kelgan, lekin taniy olinmagan holat matni */
  statusText: string
}

export type StudentPaymentHistoryItem = {
  key: string
  id: number
  date: string
  amount: number
  payType: string
  createdBy: string
  org: string
  group: string
}

/** `GET v2 /accounting-payments/show/:id` */
export type StudentPaymentDetail = {
  name: string
  groupName: string
  eduType: string
  totalPrice: number
  paid: number
  debt: number
  bonus: number
  bonusDescription: string
  percent: number
  percentLabel: string
  history: StudentPaymentHistoryItem[]
  payTypes: Array<{ id: number; name: string }>
}

export type StoreAccountingPaymentPayload = {
  student_id: number
  pay_type_id: number
  amount: number
  payment_date: string
}

export type SetAccountingBonusPayload = {
  student_id: number
  bonus: number
  bonus_description: string
}

export type StudentPaymentFilters = {
  page: number
  showCount: number
  search?: string
  groupId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export type YearReportPayType = { id: number; name?: string | null }

/** `GET v2 /accounting-general-reports/index` — karta (jami kirim, chiqim, foyda). */
export type GeneralReportCard = {
  amount: number
  label: string
  subtitle: string
  /** true — o‘sish, false — pasayish, null — noma’lum */
  grow: boolean | null
}

export type GeneralReportMonth = {
  month: number
  name: string
  cash: number
  card: number
  bank: number
  income: number
  expense: number
  profit: number
  /** Kelajakdagi, ma’lumotsiz oy — katakda «—» */
  empty: boolean
}

export type GeneralReport = {
  year: number
  month: number
  monthName: string
  income: GeneralReportCard
  expense: GeneralReportCard
  profit: GeneralReportCard
  yearProfit: GeneralReportCard
  months: GeneralReportMonth[]
}

/** `GET v2 /accounting-yearly-reports/index` — guruh bo‘yicha yillik qator. */
export type YearlyReportRow = {
  id: number
  group: string
  students: number
  price: number
  payable: number
  paid: number
  uzcard: number
  humo: number
  cash: number
  bank: number
  returned: number
  debt: number
  teacher: string
}

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
