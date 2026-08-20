export type ExpenseType = {
  id: number
  name?: string | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
  organization?: { id?: number; name?: string | null } | null
}

export type ExpenseItem = {
  id: number
  amount?: number | string | null
  date?: string | null
  description?: string | null
  organization_expense_type_id?: number | null
  organization_expense_type?: ExpenseType | null
  organization?: { id?: number; name?: string | null } | null
  created_at?: string | null
  updated_at?: string | null
}

export type ExpensePayload = {
  organization_expense_type_id: number
  date: string
  amount: string
  description?: string
}

export type ExpenseTypePayload = {
  name: string
  description?: string
}

export type MonthlyExpenseRow = {
  id?: number
  total?: number | string | null
  organization_expense_type_id?: number | null
  organization_expense_type?: ExpenseType | null
}

export type RangeExpenseRow = {
  total?: number | string | null
  organization_expense_type?: ExpenseType | null
}
