import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  DateInput,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Notification,
  Pagination,
  SearchInput,
  Select,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
} from '@/components/ui'
import {
  PAYMENT_TYPES,
  groupPaymentsPath,
  groupShowPath,
  paymentStudentAddPath,
  paymentStudentPath,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  useGroupPaymentReportQuery,
  useOrgPaymentReportQuery,
  usePaymentGroupsQuery,
  usePaymentHistoryListQuery,
  useStudentPaymentsIndexQuery,
  useYearPaymentReportQuery,
} from '@/features/payment-history'
import { useUrlTab } from '@/hooks'
import { cn } from '@/lib/cn'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate, formatNumber, fullNameOf } from '@/lib'
import { AddPaymentHistoryModal } from './AddPaymentHistoryModal'
import { CheckOpenButton, PrintCheckModal, type CheckPayload } from './PrintCheckModal'

const TABS = ['history', 'org', 'group', 'students', 'year'] as const
type TabKey = (typeof TABS)[number]

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

function money(value: number | string | null | undefined) {
  const n = Number(String(value ?? 0).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function yearAgoIso() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function groupLabel(row: {
  name_uz?: string | null
  name_ru?: string | null
  name_kiril?: string | null
  name_en?: string | null
  name?: string | null
}) {
  return row.name_uz || row.name_ru || row.name_kiril || row.name_en || row.name || '—'
}

export function PaymentHistoryPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useUrlTab(TABS, 'history')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [fio, setFio] = useState('')
  const [groupName, setGroupName] = useState('')
  const [payTypeId, setPayTypeId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [yearSearch, setYearSearch] = useState('')
  const [yearFrom, setYearFrom] = useState(yearAgoIso())
  const [yearTo, setYearTo] = useState(todayIso())
  const [addOpen, setAddOpen] = useState(false)
  const [check, setCheck] = useState<CheckPayload | null>(null)

  const orgName =
    me?.profession?.organization?.name_uz ||
    me?.profession?.organization?.name ||
    ''
  const hasAgreement =
    me?.profession?.organization?.last_agreement?.status === 1

  const groupsQuery = usePaymentGroupsQuery(tab === 'history' || addOpen)
  const historyQuery = usePaymentHistoryListQuery(
    {
      page,
      fio: fio || undefined,
      search: groupName || undefined,
      payTypeId: payTypeId ? Number(payTypeId) : null,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    },
    tab === 'history',
  )
  const orgQuery = useOrgPaymentReportQuery(page, pageSize, tab === 'org')
  const groupQuery = useGroupPaymentReportQuery(
    { page, showCount: pageSize, search: groupSearch || undefined },
    tab === 'group',
  )
  const studentsQuery = useStudentPaymentsIndexQuery(
    { page, showCount: pageSize, search: studentSearch || undefined },
    tab === 'students',
  )
  const yearQuery = useYearPaymentReportQuery(
    {
      page,
      showCount: pageSize,
      search: yearSearch || undefined,
      startDate: yearFrom,
      endDate: yearTo,
    },
    tab === 'year',
  )

  const groups = groupsQuery.data ?? []
  const history = historyQuery.data
  const org = orgQuery.data
  const groupRows = groupQuery.data
  const studentRows = studentsQuery.data
  const yearRows = yearQuery.data
  const payTypes = yearRows?.payTypes?.length
    ? yearRows.payTypes
    : PAYMENT_TYPES.map((item) => ({ id: item.id, name: item.name }))

  const loading =
    (tab === 'history' && historyQuery.isLoading) ||
    (tab === 'org' && orgQuery.isLoading) ||
    (tab === 'group' && groupQuery.isLoading) ||
    (tab === 'students' && studentsQuery.isLoading) ||
    (tab === 'year' && yearQuery.isLoading)
  const error =
    (tab === 'history' && historyQuery.isError) ||
    (tab === 'org' && orgQuery.isError) ||
    (tab === 'group' && groupQuery.isError) ||
    (tab === 'students' && studentsQuery.isError) ||
    (tab === 'year' && yearQuery.isError)

  const total =
    tab === 'history'
      ? history?.total_items ?? 0
      : tab === 'org'
        ? org?.total_items ?? 0
        : tab === 'group'
          ? groupRows?.total_items ?? 0
          : tab === 'students'
            ? studentRows?.total_items ?? 0
            : yearRows?.total_items ?? 0
  const lastPage =
    tab === 'history'
      ? Math.max(1, history?.last_page ?? 1)
      : tab === 'org'
        ? Math.max(1, org?.last_page ?? 1)
        : tab === 'group'
          ? Math.max(1, groupRows?.last_page ?? 1)
          : tab === 'students'
            ? Math.max(1, studentRows?.last_page ?? 1)
            : Math.max(1, yearRows?.last_page ?? 1)

  const changeTab = (next: TabKey) => {
    setTab(next)
    setPage(1)
  }

  const exportOrg = () => {
    const rows = org?.data ?? []
    downloadXls(
      t('paymentHistoryPage.orgExport'),
      [
        '№',
        t('paymentHistoryPage.groupName'),
        t('paymentHistoryPage.lastYear'),
        t('paymentHistoryPage.thisYear'),
        t('paymentHistoryPage.allPayments'),
        t('paymentHistoryPage.returned'),
        t('paymentHistoryPage.debtCol'),
        t('paymentHistoryPage.allNeed'),
        ...MONTHS.map((m) => t(`expensesPage.month_${m}`)),
      ],
      rows.map((row, index) => [
        (page - 1) * pageSize + index + 1,
        row.name_uz,
        money(row.last_year_payments),
        money(row.this_year_payments),
        money(row.all_payments),
        money(row.returned_payments),
        money(row.debt),
        money(row.all_need_payment),
        ...MONTHS.map((m) => money(row.month_payments?.[m - 1]?.amount)),
      ]),
    )
  }

  const exportGroup = () => {
    const rows = groupRows?.data ?? []
    downloadXls(
      t('paymentHistoryPage.groupExport'),
      [
        '№',
        t('paymentHistoryPage.groupName'),
        t('paymentHistoryPage.needPay'),
        t('paymentHistoryPage.paidTotal'),
        t('paymentHistoryPage.returned'),
        t('paymentHistoryPage.debtAmount'),
        t('paymentHistoryPage.overpay'),
        t('directorList.status'),
      ],
      rows.map((row, index) => [
        (page - 1) * pageSize + index + 1,
        groupLabel(row),
        money(row.all_need_payment),
        money(row.sum_amount),
        money(row.returned_pays),
        money(row.debt),
        money(row.overpayment),
        row.status === 1 ? t('paymentHistoryPage.active') : t('paymentHistoryPage.inactive'),
      ]),
    )
  }

  const exportYear = () => {
    const rows = yearRows?.data ?? []
    downloadXls(
      t('paymentHistoryPage.yearExport'),
      [
        '№',
        t('paymentHistoryPage.eduType'),
        t('directorList.group'),
        t('paymentHistoryPage.studentsCount'),
        t('paymentHistoryPage.eduPrice'),
        t('paymentHistoryPage.allDue'),
        ...payTypes.map((item) => item.name || String(item.id)),
        t('paymentHistoryPage.returned'),
        t('paymentHistoryPage.debtor'),
        t('paymentHistoryPage.teacher'),
      ],
      rows.map((row, index) => [
        (page - 1) * pageSize + index + 1,
        row.edu_type?.short_name_en,
        groupLabel(row),
        row.students_count ?? 0,
        money(row.education_price),
        money(row.all_need_amount),
        ...payTypes.map((item) =>
          row.all_amount_by_paytype?.[item.id] != null
            ? money(row.all_amount_by_paytype[item.id])
            : '-',
        ),
        money(row.returned_payment),
        money(row.debt),
        row.teacher,
      ]),
    )
  }

  const headerActions = (
    <div className="flex flex-nowrap items-end gap-2">
      {tab === 'history' ? (
        <>
          <DateInput
            label={t('paymentHistoryPage.from')}
            value={fromDate}
            size="sm"
            className="w-36 shrink-0"
            placeholder={t('paymentHistoryPage.paidAt')}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPage(1)
            }}
          />
          <DateInput
            label={t('paymentHistoryPage.to')}
            value={toDate}
            size="sm"
            className="w-36 shrink-0"
            placeholder={t('paymentHistoryPage.paidAt')}
            onChange={(e) => {
              setToDate(e.target.value)
              setPage(1)
            }}
          />
          <AddButton onClick={() => setAddOpen(true)}>
            {t('paymentHistoryPage.addHistory')}
          </AddButton>
        </>
      ) : null}
      {tab === 'org' ? (
        <ExportButton
          onClick={exportOrg}
          disabled={orgQuery.isLoading || !(org?.data?.length)}
        />
      ) : null}
      {tab === 'group' ? (
        <>
          <SearchInput
            className="w-48 shrink-0"
            placeholder={t('common.search')}
            onChange={(e) => {
              setGroupSearch(e.target.value)
              setPage(1)
            }}
          />
          <ExportButton
            onClick={exportGroup}
            disabled={groupQuery.isLoading || !(groupRows?.data?.length)}
          />
        </>
      ) : null}
      {tab === 'students' ? (
        <>
          <SearchInput
            className="w-48 shrink-0"
            placeholder={t('common.search')}
            onChange={(e) => {
              setStudentSearch(e.target.value)
              setPage(1)
            }}
          />
          <AddButton onClick={() => navigate(paymentStudentAddPath())} />
        </>
      ) : null}
      {tab === 'year' ? (
        <>
          <DateInput
            label={t('paymentHistoryPage.from')}
            value={yearFrom}
            size="sm"
            className="w-36 shrink-0"
            onChange={(e) => {
              setYearFrom(e.target.value)
              setPage(1)
            }}
          />
          <DateInput
            label={t('paymentHistoryPage.to')}
            value={yearTo}
            size="sm"
            className="w-36 shrink-0"
            onChange={(e) => {
              setYearTo(e.target.value)
              setPage(1)
            }}
          />
          <SearchInput
            className="w-40 shrink-0"
            placeholder={t('common.search')}
            onChange={(e) => {
              setYearSearch(e.target.value)
              setPage(1)
            }}
          />
          <ExportButton
            onClick={exportYear}
            disabled={yearQuery.isLoading || !(yearRows?.data?.length)}
          />
        </>
      ) : null}
    </div>
  )

  const groupOptions = useMemo(
    () =>
      groups.map((item) => ({
        value: item.name_uz || item.name || String(item.id),
        label: item.name_uz || item.name || String(item.id),
      })),
    [groups],
  )

  return (
    <>
      <Header title={t('paymentHistoryPage.title')} actions={headerActions} />
      <PageMain fill>
        <Tabs
          value={tab}
          onChange={(value) => changeTab(value as TabKey)}
          items={[
            { value: 'history', label: t('paymentHistoryPage.tabHistory') },
            { value: 'org', label: t('paymentHistoryPage.tabOrg') },
            { value: 'group', label: t('paymentHistoryPage.tabGroup') },
            { value: 'students', label: t('paymentHistoryPage.tabStudents') },
            { value: 'year', label: t('paymentHistoryPage.tabYear') },
          ]}
        />

        {tab === 'history' && !hasAgreement ? (
          <Notification tone="warning">
            {t('paymentHistoryPage.noAgreement')}
          </Notification>
        ) : loading ? (
          <ListPageSkeleton />
        ) : error ? (
          <ErrorMessage />
        ) : tab === 'history' ? (
          <Table storageKey="payment-history-list" className="min-w-240">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('directorList.fio')}</TH>
                <TH>{t('directorList.group')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.amount')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.paidAt')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.createdAt')}</TH>
                <TH>{t('paymentHistoryPage.payMethod')}</TH>
                <TH className="w-16">{t('paymentHistoryPage.check')}</TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH />
                <FilterTH>
                  <TableSearch
                    placeholder={t('directorList.fio')}
                    onChange={(e) => {
                      setFio(e.target.value)
                      setPage(1)
                    }}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    value={groupName}
                    clearable
                    placeholder={t('common.all')}
                    options={[
                      { value: '', label: t('common.all') },
                      ...groupOptions,
                    ]}
                    onChange={(e) => {
                      setGroupName(e.target.value)
                      setPage(1)
                    }}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH>
                  <Select
                    value={payTypeId}
                    clearable
                    placeholder={t('common.all')}
                    options={[
                      { value: '', label: t('common.all') },
                      ...PAYMENT_TYPES.map((item) => ({
                        value: String(item.id),
                        label: item.name,
                      })),
                    ]}
                    onChange={(e) => {
                      setPayTypeId(e.target.value)
                      setPage(1)
                    }}
                  />
                </FilterTH>
                <FilterTH />
              </FilterTR>
            </THead>
            <TBody>
              {(history?.data ?? []).length === 0 ? (
                <EmptyTR colSpan={8} />
              ) : (
                (history?.data ?? []).map((row, index) => (
                  <TR key={row.id}>
                    <TD className="text-center text-muted">
                      {(page - 1) * 15 + index + 1}
                    </TD>
                    <TD>{fullNameOf(row.student) ?? '—'}</TD>
                    <TD>{row.group?.name_uz || row.group?.name || '—'}</TD>
                    <TD className="text-center">
                      <Badge tone="teal">
                        {formatNumber(row.amount)} {t('dashboard.sum')}
                      </Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge tone="amber">
                        {formatDate(row.payment_date, i18n.language) ?? '—'}
                      </Badge>
                    </TD>
                    <TD className="text-center text-muted">
                      {formatDate(row.created_at, i18n.language) ?? '—'}
                    </TD>
                    <TD>
                      <Badge>{row.pay_type?.name || '—'}</Badge>
                    </TD>
                    <TD className="text-center">
                      <CheckOpenButton
                        onClick={() =>
                          setCheck({
                            id: row.id,
                            org: orgName,
                            group: row.group?.name_uz || row.group?.name,
                            student: fullNameOf(row.student),
                            paymentDate: row.created_at || row.payment_date,
                            payType:
                              PAYMENT_TYPES.find((p) => p.id === row.pay_type?.id)
                                ?.name || row.pay_type?.name,
                            amount: row.amount,
                          })
                        }
                      />
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        ) : tab === 'org' ? (
          <Table storageKey="payment-history-org" className="min-w-320">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.groupName')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.lastYear')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.thisYear')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.allPayments')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.returned')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.debtCol')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.allNeed')}</TH>
                {MONTHS.map((m) => (
                  <TH key={m} className="text-center">
                    {t(`expensesPage.month_${m}`)}
                  </TH>
                ))}
              </HeaderTR>
            </THead>
            <TBody>
              {(org?.data ?? []).length === 0 ? (
                <EmptyTR colSpan={8 + MONTHS.length} />
              ) : (
                (org?.data ?? []).map((row, index) => {
                  const paid = money(row.all_payments)
                  const need = money(row.all_need_payment)
                  const tone =
                    paid === 0
                      ? 'bg-rose-soft/70'
                      : need - paid <= 0
                        ? 'bg-teal-soft/70'
                        : 'bg-amber-soft/50'
                  return (
                    <TR key={row.id} className={cn(tone, 'hover:bg-inherit')}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        <Link
                          to={groupShowPath(row.id)}
                          className="font-semibold text-signal hover:underline"
                        >
                          {row.name_uz || '—'}
                        </Link>
                      </TD>
                      <TD className="text-center">{formatNumber(row.last_year_payments)}</TD>
                      <TD className="text-center">{formatNumber(row.this_year_payments)}</TD>
                      <TD className="text-center">{formatNumber(row.all_payments)}</TD>
                      <TD className="text-center">{formatNumber(row.returned_payments)}</TD>
                      <TD className="text-center">
                        {row.price ? formatNumber(row.debt) : ''}
                      </TD>
                      <TD className="text-center">{formatNumber(row.all_need_payment)}</TD>
                      {MONTHS.map((m) => (
                        <TD key={m} className="text-center">
                          {formatNumber(row.month_payments?.[m - 1]?.amount)}
                        </TD>
                      ))}
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        ) : tab === 'group' ? (
          <Table storageKey="payment-history-groups" className="min-w-220">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.groupName')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.needPay')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.paidTotal')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.returned')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.debtAmount')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.overpay')}</TH>
                <TH className="text-center">{t('directorList.status')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {(groupRows?.data ?? []).length === 0 ? (
                <EmptyTR colSpan={8} />
              ) : (
                (groupRows?.data ?? []).map((row, index) => (
                  <TR key={row.id}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>
                      <Link
                        to={groupPaymentsPath(row.id)}
                        className="font-semibold text-signal hover:underline"
                      >
                        {groupLabel(row)}
                      </Link>
                    </TD>
                    <TD className="text-center">{formatNumber(row.all_need_payment)}</TD>
                    <TD className="text-center">{formatNumber(row.sum_amount)}</TD>
                    <TD className="text-center">{formatNumber(row.returned_pays)}</TD>
                    <TD className="text-center">{formatNumber(row.debt)}</TD>
                    <TD className="text-center">{formatNumber(row.overpayment)}</TD>
                    <TD className="text-center">
                      <Badge tone={row.status === 1 ? 'teal' : 'rose'}>
                        {row.status === 1
                          ? t('paymentHistoryPage.active')
                          : t('paymentHistoryPage.inactive')}
                      </Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        ) : tab === 'students' ? (
          <Table storageKey="payment-history-students" className="min-w-180">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.fioFull')}</TH>
                <TH>{t('paymentHistoryPage.studentGroup')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.payAmount')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.lastPayDate')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {(studentRows?.data ?? []).length === 0 ? (
                <EmptyTR colSpan={5} />
              ) : (
                (studentRows?.data ?? []).map((row, index) => (
                  <TR key={row.id}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>
                      <Link
                        to={paymentStudentPath(row.id)}
                        className="font-semibold text-signal hover:underline"
                      >
                        {fullNameOf(row) ?? '—'}
                      </Link>
                    </TD>
                    <TD>
                      {row.mygroup?.[0]?.id ? (
                        <Link
                          to={groupShowPath(row.mygroup[0].id)}
                          className="text-signal hover:underline"
                        >
                          {row.mygroup[0].name_uz || '—'}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TD>
                    <TD className="text-center">{formatNumber(row.amount)}</TD>
                    <TD className="text-center">
                      {formatDate(row.last_payment?.payment_date, i18n.language) ?? '—'}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        ) : (
          <Table storageKey="payment-history-year" className="min-w-280">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.eduType')}</TH>
                <TH>{t('directorList.group')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.studentsCount')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.eduPrice')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.allDue')}</TH>
                {payTypes.map((item) => (
                  <TH key={item.id} className="text-center">
                    {item.name}
                  </TH>
                ))}
                <TH className="text-center">{t('paymentHistoryPage.returned')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.debtor')}</TH>
                <TH>{t('paymentHistoryPage.teacher')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {(yearRows?.data ?? []).length === 0 ? (
                <EmptyTR colSpan={9 + payTypes.length} />
              ) : (
                (yearRows?.data ?? []).map((row, index) => (
                  <TR key={row.id}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD>{row.edu_type?.short_name_en || '—'}</TD>
                    <TD>
                      <Link
                        to={groupShowPath(row.id)}
                        className="font-semibold text-signal hover:underline"
                      >
                        {groupLabel(row)}
                      </Link>
                    </TD>
                    <TD className="text-center">{row.students_count ?? 0}</TD>
                    <TD className="text-center">{formatNumber(row.education_price)}</TD>
                    <TD className="text-center">{formatNumber(row.all_need_amount)}</TD>
                    {payTypes.map((item) => (
                      <TD key={item.id} className="text-center">
                        {row.all_amount_by_paytype?.[item.id] != null
                          ? formatNumber(row.all_amount_by_paytype[item.id])
                          : '—'}
                      </TD>
                    ))}
                    <TD className="text-center">{formatNumber(row.returned_payment)}</TD>
                    <TD className="text-center">{formatNumber(row.debt)}</TD>
                    <TD>{row.teacher || '—'}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}

        <Pagination
          page={page}
          totalPages={lastPage}
          onPageChange={setPage}
          total={total}
          pageSize={tab === 'history' ? 15 : pageSize}
          onPageSizeChange={
            tab === 'history'
              ? undefined
              : (size) => {
                  setPageSize(size)
                  setPage(1)
                }
          }
        />
      </PageMain>

      <AddPaymentHistoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groups={groups}
      />
      <PrintCheckModal
        open={Boolean(check)}
        payload={check}
        onClose={() => setCheck(null)}
      />
    </>
  )
}
