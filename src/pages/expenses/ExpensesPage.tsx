import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  DateInput,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
  notify,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import {
  useDeleteExpenseMutation,
  useDeleteExpenseTypeMutation,
  useExpenseTypesQuery,
  useExpensesQuery,
  useMonthlyExpensesQuery,
  useRangeExpensesQuery,
} from '@/features/expenses'
import { cn } from '@/lib/cn'
import { formatDate, formatNumber } from '@/lib/format'
import type { ExpenseItem, ExpenseType, MonthlyExpenseRow } from '@/types/expenses'
import { ExpenseFormModal } from './ExpenseFormModal'
import { ExpenseTypeFormModal } from './ExpenseTypeFormModal'

type TabKey = 'add' | 'year' | 'range' | 'types'

function money(value: number | string | null | undefined) {
  const n = parseFloat(String(value ?? 0).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function typeName(row: ExpenseItem, types: ExpenseType[]) {
  return (
    row.organization_expense_type?.name ||
    types.find((item) => item.id === row.organization_expense_type_id)?.name ||
    '—'
  )
}

export function ExpensesPage() {
  const { t, i18n } = useTranslation()
  const { isSuperAdmin } = useAuth()
  const [tab, setTab] = useState<TabKey>('add')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exactDate, setExactDate] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)
  const [editingType, setEditingType] = useState<ExpenseType | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<ExpenseItem | null>(null)
  const [deleteType, setDeleteType] = useState<ExpenseType | null>(null)

  const typesAllQuery = useExpenseTypesQuery({
    page: 1,
    showCount: 200,
  })
  const expensesQuery = useExpensesQuery({
    page,
    showCount: pageSize,
    date: exactDate || undefined,
    from: from || undefined,
    to: to || undefined,
    enabled: tab === 'add',
  })
  const yearQuery = useMonthlyExpensesQuery(year, tab === 'year')
  const rangeQuery = useRangeExpensesQuery(
    rangeFrom,
    rangeTo,
    tab === 'range',
  )
  const typesQuery = useExpenseTypesQuery({
    page,
    showCount: pageSize,
    search: typeSearch || undefined,
    withOrganization: isSuperAdmin,
    enabled: tab === 'types',
  })
  const deleteExpenseMutation = useDeleteExpenseMutation()
  const deleteTypeMutation = useDeleteExpenseTypeMutation()

  const types = typesAllQuery.data?.data ?? []
  const expenses = expensesQuery.data
  const typeRows = typesQuery.data
  const rangeRows = rangeQuery.data ?? []
  const yearMap = yearQuery.data

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: current - 2017 }, (_, i) => String(current - i))
  }, [])

  const monthRows = useMemo(() => {
    if (!yearMap) return []
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      const list = yearMap[month] ?? []
      const expensesInMonth = list.filter(
        (row) => row.organization_expense_type_id != null,
      )
      const total = list.reduce((sum, row) => sum + money(row.total), 0)
      return { month, list, count: expensesInMonth.length, total }
    })
  }, [yearMap])

  const yearTotal = monthRows.reduce((sum, row) => sum + row.total, 0)
  const rangeTotal = rangeRows.reduce((sum, row) => sum + money(row.total), 0)

  const onAdd = () => {
    if (tab === 'types') {
      setEditingType(null)
      setTypeOpen(true)
    } else {
      setEditingExpense(null)
      setExpenseOpen(true)
    }
  }

  const changeTab = (next: TabKey) => {
    setTab(next)
    setPage(1)
    setExpandedMonth(null)
  }

  const loading =
    (tab === 'add' && expensesQuery.isLoading) ||
    (tab === 'year' && yearQuery.isLoading) ||
    (tab === 'range' && rangeQuery.isLoading) ||
    (tab === 'types' && typesQuery.isLoading)
  const error =
    (tab === 'add' && expensesQuery.isError) ||
    (tab === 'year' && yearQuery.isError) ||
    (tab === 'range' && rangeQuery.isError) ||
    (tab === 'types' && typesQuery.isError)

  const totalItems =
    tab === 'add'
      ? expenses?.total_items ?? 0
      : tab === 'types'
        ? typeRows?.total_items ?? 0
        : tab === 'range'
          ? rangeRows.length
          : 12
  const totalPages =
    tab === 'add'
      ? Math.max(1, expenses?.last_page ?? 1)
      : tab === 'types'
        ? Math.max(1, typeRows?.last_page ?? 1)
        : 1

  return (
    <>
      <Header
        title={t('expensesPage.title')}
        actions={
          <div className="flex flex-nowrap items-end gap-2">
            {tab === 'add' ? (
              <>
                <DateInput
                  label={t('expensesPage.from')}
                  value={from}
                  className="w-36 shrink-0"
                  onChange={(e) => {
                    setFrom(e.target.value)
                    setPage(1)
                  }}
                />
                <DateInput
                  label={t('expensesPage.to')}
                  value={to}
                  className="w-36 shrink-0"
                  onChange={(e) => {
                    setTo(e.target.value)
                    setPage(1)
                  }}
                />
                <DateInput
                  label={t('expensesPage.searchDate')}
                  value={exactDate}
                  className="w-44 shrink-0"
                  onChange={(e) => {
                    setExactDate(e.target.value)
                    setPage(1)
                  }}
                />
              </>
            ) : null}
            {tab === 'year' ? (
              <Select
                label={t('expensesPage.year')}
                value={year}
                options={years.map((value) => ({ value, label: value }))}
                className="w-28 shrink-0"
                triggerClassName="min-w-28"
                onChange={(e) => setYear(e.target.value)}
              />
            ) : null}
            {tab === 'range' ? (
              <>
                <DateInput
                  label={t('expensesPage.from')}
                  value={rangeFrom}
                  className="w-36 shrink-0"
                  onChange={(e) => setRangeFrom(e.target.value)}
                />
                <DateInput
                  label={t('expensesPage.to')}
                  value={rangeTo}
                  className="w-36 shrink-0"
                  onChange={(e) => setRangeTo(e.target.value)}
                />
              </>
            ) : null}
            {tab === 'types' ? (
              <SearchInput
                value={typeSearch}
                onChange={(e) => {
                  setTypeSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={t('common.search')}
                className="w-48 shrink-0"
                size="md"
              />
            ) : null}
            <Button variant="primary" className="h-11 shrink-0" onClick={onAdd}>
              <Plus className="size-3.5" aria-hidden />
              {t('common.add')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <Tabs
          value={tab}
          onChange={changeTab}
          items={[
            { value: 'add', label: t('expensesPage.tabAdd') },
            { value: 'year', label: t('expensesPage.tabYear') },
            { value: 'range', label: t('expensesPage.tabRange') },
            { value: 'types', label: t('expensesPage.tabTypes') },
          ]}
        />
        {error ? (
          <ErrorMessage />
        ) : loading ? (
          <ListPageSkeleton rows={8} />
        ) : tab === 'add' ? (
          <ExpensesTable
            rows={expenses?.data ?? []}
            types={types}
            page={page}
            pageSize={pageSize}
            superadmin={isSuperAdmin}
            lang={i18n.language}
            onEdit={(row) => {
              setEditingExpense(row)
              setExpenseOpen(true)
            }}
            onDelete={setDeleteExpense}
          />
        ) : tab === 'year' ? (
          <YearTable
            rows={monthRows}
            expanded={expandedMonth}
            onToggle={(month) =>
              setExpandedMonth((prev) => (prev === month ? null : month))
            }
            yearTotal={yearTotal}
          />
        ) : tab === 'range' ? (
          <RangeTable rows={rangeRows} total={rangeTotal} />
        ) : (
          <TypesTable
            rows={typeRows?.data ?? []}
            page={page}
            pageSize={pageSize}
            superadmin={isSuperAdmin}
            lang={i18n.language}
            onEdit={(row) => {
              setEditingType(row)
              setTypeOpen(true)
            }}
            onDelete={setDeleteType}
          />
        )}
        {tab === 'add' || tab === 'types' ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={totalItems}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        ) : tab === 'range' ? (
          <Pagination
            page={1}
            totalPages={1}
            onPageChange={() => undefined}
            total={rangeRows.length}
          />
        ) : (
          <Pagination
            page={1}
            totalPages={1}
            onPageChange={() => undefined}
            total={12}
          />
        )}
      </PageMain>
      <ExpenseFormModal
        open={expenseOpen}
        onClose={() => {
          setExpenseOpen(false)
          setEditingExpense(null)
        }}
        types={types}
        editing={editingExpense}
      />
      <ExpenseTypeFormModal
        open={typeOpen}
        onClose={() => {
          setTypeOpen(false)
          setEditingType(null)
        }}
        editing={editingType}
      />
      <ConfirmDialog
        open={Boolean(deleteExpense || deleteType)}
        onClose={() => {
          setDeleteExpense(null)
          setDeleteType(null)
        }}
        title={t('common.delete')}
        loading={deleteExpenseMutation.isPending || deleteTypeMutation.isPending}
        onConfirm={() => {
          const onSuccess = () => {
            notify.success(t('common.deleted'))
            setDeleteExpense(null)
            setDeleteType(null)
          }
          const onError = (err: Error) =>
            notify.error(err.message || t('common.loadError'))
          if (deleteExpense) {
            deleteExpenseMutation.mutate(deleteExpense.id, { onSuccess, onError })
            return
          }
          if (deleteType) {
            deleteTypeMutation.mutate(deleteType.id, { onSuccess, onError })
          }
        }}
      />
    </>
  )
}

function ExpensesTable({
  rows,
  types,
  page,
  pageSize,
  superadmin,
  lang,
  onEdit,
  onDelete,
}: {
  rows: ExpenseItem[]
  types: ExpenseType[]
  page: number
  pageSize: number
  superadmin: boolean
  lang: string
  onEdit: (row: ExpenseItem) => void
  onDelete: (row: ExpenseItem) => void
}) {
  const { t } = useTranslation()
  const colSpan = superadmin ? 8 : 7
  return (
    <Table storageKey="expenses-list" className="min-w-220">
      <THead>
        <TR>
          <TH className="w-12 text-center">№</TH>
          <TH className="text-center">{t('expensesPage.amount')}</TH>
          <TH>{t('expensesPage.expenseType')}</TH>
          {superadmin ? <TH>{t('expensesPage.organization')}</TH> : null}
          <TH className="text-center">{t('expensesPage.date')}</TH>
          <TH>{t('expensesPage.comment')}</TH>
          <TH className="text-center">{t('expensesPage.createdUpdated')}</TH>
          <TH className="w-24">{t('common.actions')}</TH>
        </TR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <TR>
            <TD className="py-6 text-center" colSpan={colSpan}>
              <EmptyState
                className="border-0 py-4 shadow-none"
                description={t('common.empty')}
              />
            </TD>
          </TR>
        ) : (
          rows.map((row, index) => (
            <TR key={row.id}>
              <TD className="text-center text-muted">
                {(page - 1) * pageSize + index + 1}
              </TD>
              <TD className="text-center">
                <Badge tone="teal" className="px-2 py-1 text-[11px]">
                  {formatNumber(money(row.amount))}
                </Badge>
              </TD>
              <TD>{typeName(row, types)}</TD>
              {superadmin ? (
                <TD>
                  {row.organization?.name || (
                    <Badge tone="rose">{t('expensesPage.missingOrg')}</Badge>
                  )}
                </TD>
              ) : null}
              <TD className="text-center">
                <Badge className="px-2 py-1 text-[11px]">
                  {formatDate(row.date, lang) || '—'}
                </Badge>
              </TD>
              <TD className="text-muted">
                {row.description || t('expensesPage.notEntered')}
              </TD>
              <TD className="text-center">
                <span className="inline-flex items-center gap-1">
                  <Badge tone="amber" className="px-2 py-1 text-[11px]">
                    {formatDate(row.created_at, lang) || '—'}
                  </Badge>
                  –
                  <Badge tone="teal" className="px-2 py-1 text-[11px]">
                    {formatDate(row.updated_at, lang) || '—'}
                  </Badge>
                </span>
              </TD>
              <TD>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('common.edit')}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('common.delete')}
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}

function YearTable({
  rows,
  expanded,
  onToggle,
  yearTotal,
}: {
  rows: {
    month: number
    list: MonthlyExpenseRow[]
    count: number
    total: number
  }[]
  expanded: number | null
  onToggle: (month: number) => void
  yearTotal: number
}) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Table storageKey="expenses-year" className="min-w-140">
        <THead>
          <TR>
            <TH className="w-10" />
            <TH>{t('expensesPage.month')}</TH>
            <TH className="w-40 text-center">{t('expensesPage.expenseCount')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => {
            const open = expanded === row.month
            const canOpen = row.list.some(
              (item) => item.organization_expense_type_id != null,
            )
            return (
              <Fragment key={row.month}>
                <TR>
                  <TD>
                    {canOpen ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-expanded={open}
                        onClick={() => onToggle(row.month)}
                      >
                        <ChevronDown
                          className={cn(
                            'size-4 text-muted transition',
                            !open && '-rotate-90',
                          )}
                        />
                      </Button>
                    ) : null}
                  </TD>
                  <TD>{t(`expensesPage.month_${row.month}`)}</TD>
                  <TD className="text-center">{row.count}</TD>
                </TR>
                {open ? (
                  <TR>
                    <TD colSpan={3} className="bg-fog/40">
                      <MonthDetail rows={row.list} />
                    </TD>
                  </TR>
                ) : null}
              </Fragment>
            )
          })}
        </TBody>
      </Table>
      <p className="shrink-0 px-1 pt-2 text-right text-sm font-semibold text-deep">
        {t('expensesPage.totalSum', { amount: formatNumber(yearTotal) })}
      </p>
    </div>
  )
}

function MonthDetail({ rows }: { rows: MonthlyExpenseRow[] }) {
  const { t } = useTranslation()
  const total = rows.reduce((sum, row) => sum + money(row.total), 0)
  return (
    <div className="py-2">
      <Table bordered={false} storageKey="expenses-year-month">
        <THead>
          <TR>
            <TH className="w-12 text-center">№</TH>
            <TH className="text-center">{t('expensesPage.amount')}</TH>
            <TH>{t('expensesPage.expenseType')}</TH>
            <TH>{t('expensesPage.comment')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row, index) => (
            <TR key={row.id ?? index}>
              <TD className="text-center text-muted">{index + 1}</TD>
              <TD className="text-center">
                <Badge tone="teal" className="px-2 py-1 text-[11px]">
                  {formatNumber(money(row.total))}
                </Badge>
              </TD>
              <TD>{row.organization_expense_type?.name || '—'}</TD>
              <TD className="text-muted">
                {row.organization_expense_type?.description ||
                  t('expensesPage.notEntered')}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <p className="pt-2 text-right text-sm font-semibold text-deep">
        {t('expensesPage.totalSum', { amount: formatNumber(total) })}
      </p>
    </div>
  )
}

function RangeTable({
  rows,
  total,
}: {
  rows: { total?: number | string | null; organization_expense_type?: ExpenseType | null }[]
  total: number
}) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Table storageKey="expenses-range" className="min-w-160">
        <THead>
          <TR>
            <TH className="w-12 text-center">№</TH>
            <TH>{t('expensesPage.expenseType')}</TH>
            <TH className="text-center">{t('expensesPage.amount')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD className="py-6 text-center" colSpan={3}>
                <EmptyState
                  className="border-0 py-4 shadow-none"
                  description={t('common.empty')}
                />
              </TD>
            </TR>
          ) : (
            rows.map((row, index) => (
              <TR key={row.organization_expense_type?.id ?? index}>
                <TD className="text-center text-muted">{index + 1}</TD>
                <TD>{row.organization_expense_type?.name || '—'}</TD>
                <TD className="text-center">
                  <Badge tone="teal" className="px-2 py-1 text-[11px]">
                    {formatNumber(money(row.total))}
                  </Badge>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
      <p className="shrink-0 px-1 pt-2 text-right text-sm font-semibold text-deep">
        {t('expensesPage.totalSum', { amount: formatNumber(total) })}
      </p>
    </div>
  )
}

function TypesTable({
  rows,
  page,
  pageSize,
  superadmin,
  lang,
  onEdit,
  onDelete,
}: {
  rows: ExpenseType[]
  page: number
  pageSize: number
  superadmin: boolean
  lang: string
  onEdit: (row: ExpenseType) => void
  onDelete: (row: ExpenseType) => void
}) {
  const { t } = useTranslation()
  const colSpan = superadmin ? 6 : 5
  return (
    <Table storageKey="expense-types" className="min-w-200">
      <THead>
        <TR>
          <TH className="w-12 text-center">№</TH>
          <TH>{t('expensesPage.name')}</TH>
          {superadmin ? <TH>{t('expensesPage.organization')}</TH> : null}
          <TH>{t('expensesPage.comment')}</TH>
          <TH className="text-center">{t('expensesPage.createdUpdated')}</TH>
          <TH className="w-24">{t('common.actions')}</TH>
        </TR>
      </THead>
      <TBody>
        {rows.length === 0 ? (
          <TR>
            <TD className="py-6 text-center" colSpan={colSpan}>
              <EmptyState
                className="border-0 py-4 shadow-none"
                description={t('common.empty')}
              />
            </TD>
          </TR>
        ) : (
          rows.map((row, index) => (
            <TR key={row.id}>
              <TD className="text-center text-muted">
                {(page - 1) * pageSize + index + 1}
              </TD>
              <TD className="font-medium">{row.name || '—'}</TD>
              {superadmin ? (
                <TD>
                  {row.organization?.name || (
                    <Badge tone="rose">{t('expensesPage.missingOrg')}</Badge>
                  )}
                </TD>
              ) : null}
              <TD className="text-muted">
                {row.description || t('expensesPage.notEntered')}
              </TD>
              <TD className="text-center">
                <span className="inline-flex items-center gap-1">
                  <Badge tone="amber" className="px-2 py-1 text-[11px]">
                    {formatDate(row.created_at, lang) || '—'}
                  </Badge>
                  –
                  <Badge tone="teal" className="px-2 py-1 text-[11px]">
                    {formatDate(row.updated_at, lang) || '—'}
                  </Badge>
                </span>
              </TD>
              <TD>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('common.edit')}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={t('common.delete')}
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  )
}
