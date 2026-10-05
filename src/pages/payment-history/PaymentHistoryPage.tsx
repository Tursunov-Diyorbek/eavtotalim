import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Badge,
  Button,
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
  notify,
} from '@/components/ui'
import { fetchAllAccountingGroupReport } from '@/api'
import {
  PAYMENT_TYPES,
  groupPaymentsPath,
  paymentStudentAddPath,
} from '@/config'
import { useAuth } from '@/features/auth'
import {
  useAccountingGeneralReportQuery,
  useGroupPaymentReportQuery,
  usePaymentGroupsQuery,
  usePaymentHistoryListQuery,
  useStudentPaymentGroupsQuery,
  useStudentPaymentsIndexQuery,
  useYearPaymentReportQuery,
} from '@/features/payment-history'
import { useOpenedOnce, usePageState, useUrlTab } from '@/hooks'
import { cn } from '@/lib/cn'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate, formatNumber, fullNameOf } from '@/lib'
import { AddPaymentHistoryModal } from './AddPaymentHistoryModal'
import { OrgGeneralReport } from './OrgGeneralReport'
import { StudentPaymentDetailModal } from './StudentPaymentDetailModal'
import type { PaymentHistoryItem, StudentPaymentStatus } from '@/types/payment-history'
import { CheckOpenButton, PrintCheckModal, type CheckPayload } from './PrintCheckModal'

function cashierName(row: PaymentHistoryItem) {
  if (typeof row.created_by === 'string' && row.created_by.trim()) return row.created_by
  if (row.created_by && typeof row.created_by === 'object' && row.created_by.name) {
    return row.created_by.name
  }
  return row.user?.name || row.cashier || null
}

const TABS = ['history', 'org', 'group', 'students', 'year'] as const
type TabKey = (typeof TABS)[number]

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

function DistributionBar({
  paid,
  partial,
  unpaid,
}: {
  paid: number
  partial: number
  unpaid: number
}) {
  const total = paid + partial + unpaid
  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-fog"
      title={`${paid}% / ${partial}% / ${unpaid}%`}
    >
      {total > 0 ? (
        <>
          <span className="h-full bg-teal" style={{ width: `${(paid / total) * 100}%` }} />
          <span className="h-full bg-amber" style={{ width: `${(partial / total) * 100}%` }} />
          <span className="h-full bg-rose" style={{ width: `${(unpaid / total) * 100}%` }} />
        </>
      ) : null}
    </div>
  )
}

function StudentPaymentBadge({
  status,
  text,
}: {
  status: StudentPaymentStatus
  text: string
}) {
  const { t } = useTranslation()
  if (!status) return text ? <Badge tone="neutral">{text}</Badge> : <>—</>
  const tone = status === 'paid' ? 'teal' : status === 'partial' ? 'amber' : 'rose'
  const label =
    status === 'paid'
      ? t('paymentHistoryPage.psPaid')
      : status === 'partial'
        ? t('paymentHistoryPage.psPartial')
        : status === 'unpaid'
          ? t('paymentHistoryPage.psUnpaid')
          : t('paymentHistoryPage.psDebt')
  return <Badge tone={tone}>{label}</Badge>
}

export function PaymentHistoryPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useUrlTab(TABS, 'history')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [fio, setFio] = usePageState('fio', '')
  const [groupName, setGroupName] = usePageState('groupName', '')
  const [payTypeId, setPayTypeId] = usePageState('payTypeId', '')
  const [fromDate, setFromDate] = usePageState('fromDate', '')
  const [toDate, setToDate] = usePageState('toDate', '')
  const [groupSearch, setGroupSearch] = usePageState('groupSearch', '')
  const [studentSearch, setStudentSearch] = usePageState('studentSearch', '')
  const [psGroup, setPsGroup] = usePageState('psGroup', '')
  const [psStatus, setPsStatus] = usePageState('psStatus', '')
  const [psFrom, setPsFrom] = usePageState('psFrom', '')
  const [psTo, setPsTo] = usePageState('psTo', '')
  const [yearSearch, setYearSearch] = usePageState('yearSearch', '')
  const [yearFrom, setYearFrom] = usePageState('yearFrom', yearAgoIso())
  const [yearTo, setYearTo] = usePageState('yearTo', todayIso())
  const [reportYear, setReportYear] = usePageState(
    'reportYear',
    String(new Date().getFullYear()),
  )
  const [addOpen, setAddOpen] = useState(false)
  const [groupExporting, setGroupExporting] = useState(false)
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null)
  const [check, setCheck] = useState<CheckPayload | null>(null)

  const orgName =
    me?.profession?.organization?.name_uz ||
    me?.profession?.organization?.name ||
    ''
  const hasAgreement =
    me?.profession?.organization?.last_agreement?.status === 1

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
  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupName))
  const groupsQuery = usePaymentGroupsQuery(groupsEnabled && tab === 'history')
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data])
  const orgQuery = useAccountingGeneralReportQuery(Number(reportYear), tab === 'org')
  const groupQuery = useGroupPaymentReportQuery(
    { page, showCount: pageSize, search: groupSearch || undefined },
    tab === 'group',
  )
  const studentsQuery = useStudentPaymentsIndexQuery(
    {
      page,
      showCount: pageSize,
      search: studentSearch || undefined,
      groupId: psGroup || undefined,
      status: psStatus || undefined,
      startDate: psFrom || undefined,
      endDate: psTo || undefined,
    },
    tab === 'students',
  )
  const [psGroupsEnabled, openPsGroups] = useOpenedOnce(Boolean(psGroup))
  const psGroupsQuery = useStudentPaymentGroupsQuery(psGroupsEnabled && tab === 'students')
  const psGroupOptions = useMemo(
    () => [
      { value: '', label: t('paymentHistoryPage.psAllGroups') },
      ...(psGroupsQuery.data ?? []).map((g) => ({ value: String(g.id), label: g.name })),
    ],
    [psGroupsQuery.data, t],
  )
  const psStatusOptions = [
    { value: '', label: t('paymentHistoryPage.psStatusAll') },
    { value: 'paid', label: t('paymentHistoryPage.psPaid') },
    { value: 'partial', label: t('paymentHistoryPage.psPartial') },
    { value: 'debt', label: t('paymentHistoryPage.psDebt') },
  ]
  const reportYearOf = Number(yearFrom.slice(0, 4)) || new Date().getFullYear()
  const yearQuery = useYearPaymentReportQuery(reportYearOf, tab === 'year')
  const yearFiltered = useMemo(() => {
    const rows = yearQuery.data?.rows ?? []
    const q = yearSearch.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        row.group.toLowerCase().includes(q) || row.teacher.toLowerCase().includes(q),
    )
  }, [yearQuery.data, yearSearch])
  const yearPageRows = yearFiltered.slice((page - 1) * pageSize, page * pageSize)

  const history = historyQuery.data
  const org = orgQuery.data
  const groupRows = groupQuery.data
  const studentRows = studentsQuery.data
  const loading =
    (tab === 'history' && historyQuery.isLoading) ||
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
      : tab === 'group'
          ? groupRows?.total_items ?? 0
          : tab === 'students'
            ? studentRows?.total_items ?? 0
            : yearFiltered.length
  const lastPage =
    tab === 'history'
      ? Math.max(1, history?.last_page ?? 1)
      : tab === 'group'
          ? Math.max(1, groupRows?.last_page ?? 1)
          : tab === 'students'
            ? Math.max(1, studentRows?.last_page ?? 1)
            : Math.max(1, Math.ceil(yearFiltered.length / pageSize) || 1)

  const changeTab = (next: TabKey) => {
    setTab(next)
    setPage(1)
  }

  const reportYearOptions = Array.from({ length: 7 }, (_, index) => {
    const year = new Date().getFullYear() - index
    return { value: String(year), label: t('paymentHistoryPage.grYearOption', { year }) }
  })

  const exportOrg = () => {
    if (!org) return
    downloadXls(
      `tashkilot-umumiy-hisobot-${org.year}`,
      [
        t('paymentHistoryPage.grMonth'),
        t('paymentHistoryPage.grCash'),
        t('paymentHistoryPage.grCard'),
        t('paymentHistoryPage.grBank'),
        t('paymentHistoryPage.grTotalIncome'),
        t('paymentHistoryPage.grTotalExpense'),
        t('paymentHistoryPage.grNetProfit'),
      ],
      org.months.map((m) => [
        m.name || t(`expensesPage.month_${m.month}`),
        ...(m.empty
          ? ['—', '—', '—', '—', '—', '—']
          : [m.cash, m.card, m.bank, m.income, m.expense, m.profit]),
      ]),
    )
  }

  const exportGroup = async () => {
    setGroupExporting(true)
    try {
      const rows = await fetchAllAccountingGroupReport(groupSearch || undefined)
      if (!rows.length) {
        notify.warning(t('paymentHistoryPage.grpExportEmpty'))
        return
      }
      downloadXls(
        'guruh-hisoboti',
        [
          '№',
          t('paymentHistoryPage.groupName'),
          t('paymentHistoryPage.grpStudents'),
          t('paymentHistoryPage.grpPaid'),
          t('paymentHistoryPage.grpPartial'),
          t('paymentHistoryPage.grpUnpaid'),
          t('paymentHistoryPage.grpDistribution'),
        ],
        rows.map((row, index) => [
          index + 1,
          row.name,
          row.students,
          row.paid.label,
          row.partial.label,
          row.unpaid.label,
          `${row.paid.percent}% / ${row.partial.percent}% / ${row.unpaid.percent}%`,
        ]),
      )
    } catch {
      notify.error(t('paymentHistoryPage.grpExportError'))
    } finally {
      setGroupExporting(false)
    }
  }

  const exportYear = () => {
    downloadXls(
      `yillik-hisobot-${reportYearOf}`,
      [
        '№',
        t('paymentHistoryPage.yrGroup'),
        t('paymentHistoryPage.grpStudents'),
        t('paymentHistoryPage.eduPrice'),
        t('paymentHistoryPage.yrPayable'),
        t('paymentHistoryPage.psPaidCol'),
        'UZCARD',
        'HUMO',
        t('paymentHistoryPage.grCash'),
        t('paymentHistoryPage.yrTransfer'),
        t('paymentHistoryPage.returned'),
        t('paymentHistoryPage.debtor'),
        t('paymentHistoryPage.teacher'),
      ],
      yearFiltered.map((row, index) => [
        index + 1,
        row.group,
        row.students,
        row.price,
        row.payable,
        row.paid,
        row.uzcard,
        row.humo,
        row.cash,
        row.bank,
        row.returned,
        row.debt,
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
        <>
          <Select
            className="w-36 shrink-0"
            options={reportYearOptions}
            value={reportYear}
            onChange={(e) => setReportYear(e.target.value)}
          />
          <ExportButton onClick={exportOrg} disabled={orgQuery.isLoading || !org} />
        </>
      ) : null}
      {tab === 'group' ? (
        <>
          <SearchInput
            className="w-64 shrink-0"
            placeholder={t('paymentHistoryPage.grpSearch')}
            onChange={(e) => {
              setGroupSearch(e.target.value)
              setPage(1)
            }}
          />
          <ExportButton
            onClick={() => void exportGroup()}
            loading={groupExporting}
            disabled={groupQuery.isLoading || !(groupRows?.data?.length)}
          />
        </>
      ) : null}
      {tab === 'students' ? (
        <>
          <SearchInput
            className="w-64 shrink-0"
            placeholder={t('paymentHistoryPage.psSearch')}
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
            disabled={yearQuery.isLoading || yearFiltered.length === 0}
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
                    onOpen={openGroups}
                    loading={groupsQuery.isFetching && groups.length === 0}
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
                            cashier: cashierName(row),
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
          <div className="min-h-0 flex-1 overflow-y-auto">
            <OrgGeneralReport report={org} loading={orgQuery.isLoading} />
          </div>
        ) : tab === 'group' ? (
          <>
            <Notification tone="info" className="mb-3 shrink-0">
              {t('paymentHistoryPage.grpHint')}
            </Notification>
            <Table storageKey="payment-history-groups" className="min-w-220">
              <THead>
                <HeaderTR>
                  <TH className="w-12 text-center">№</TH>
                  <TH>{t('paymentHistoryPage.groupName')}</TH>
                  <TH className="w-36 text-center">{t('paymentHistoryPage.grpStudents')}</TH>
                  <TH className="w-36 text-center">{t('paymentHistoryPage.grpPaid')}</TH>
                  <TH className="w-36 text-center">{t('paymentHistoryPage.grpPartial')}</TH>
                  <TH className="w-40 text-center">{t('paymentHistoryPage.grpUnpaid')}</TH>
                  <TH className="w-48">{t('paymentHistoryPage.grpDistribution')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {(groupRows?.data ?? []).length === 0 ? (
                  <EmptyTR colSpan={7} />
                ) : (
                  (groupRows?.data ?? []).map((row, index) => (
                    <TR key={row.id || index}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        <Link
                          to={groupPaymentsPath(row.id)}
                          className="font-semibold text-signal hover:underline"
                        >
                          {row.name}
                        </Link>
                      </TD>
                      <TD className="text-center">{row.students}</TD>
                      <TD className="text-center font-semibold text-teal">{row.paid.label}</TD>
                      <TD className="text-center font-semibold text-amber">
                        {row.partial.label}
                      </TD>
                      <TD className="text-center font-semibold text-rose">{row.unpaid.label}</TD>
                      <TD>
                        <DistributionBar
                          paid={row.paid.percent}
                          partial={row.partial.percent}
                          unpaid={row.unpaid.percent}
                        />
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </>
        ) : tab === 'students' ? (
          <>
            <div className="mb-3 grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Select
                options={psGroupOptions}
                value={psGroup}
                placeholder={t('paymentHistoryPage.psAllGroups')}
                onOpen={openPsGroups}
                loading={psGroupsQuery.isFetching && !psGroupsQuery.data?.length}
                onChange={(e) => {
                  setPsGroup(e.target.value)
                  setPage(1)
                }}
              />
              <Select
                options={psStatusOptions}
                value={psStatus}
                placeholder={t('paymentHistoryPage.psStatusAll')}
                onChange={(e) => {
                  setPsStatus(e.target.value)
                  setPage(1)
                }}
              />
              <DateInput
                value={psFrom}
                placeholder={t('paymentHistoryPage.psFrom')}
                onChange={(e) => {
                  setPsFrom(e.target.value)
                  setPage(1)
                }}
              />
              <DateInput
                value={psTo}
                placeholder={t('paymentHistoryPage.psTo')}
                onChange={(e) => {
                  setPsTo(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <Table storageKey="payment-history-students" className="min-w-260">
              <THead>
                <HeaderTR>
                  <TH className="w-12 text-center">№</TH>
                  <TH>{t('paymentHistoryPage.fioFull')}</TH>
                  <TH>{t('paymentHistoryPage.psGroup')}</TH>
                  <TH className="text-right">{t('paymentHistoryPage.psTotalPrice')}</TH>
                  <TH className="text-right">{t('paymentHistoryPage.psDebtCol')}</TH>
                  <TH className="text-right">{t('paymentHistoryPage.psPaidCol')}</TH>
                  <TH className="text-right">{t('paymentHistoryPage.psBonus')}</TH>
                  <TH>{t('paymentHistoryPage.psBonusNote')}</TH>
                  <TH className="text-center">{t('paymentHistoryPage.psDate')}</TH>
                  <TH className="text-center">{t('paymentHistoryPage.psStatus')}</TH>
                </HeaderTR>
              </THead>
              <TBody>
                {(studentRows?.data ?? []).length === 0 ? (
                  <EmptyTR colSpan={10} />
                ) : (
                  (studentRows?.data ?? []).map((row, index) => (
                    <TR key={row.key}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        {row.studentId ? (
                          <Button
                            variant="link"
                            size="inline"
                            onClick={() => setDetailStudentId(row.studentId)}
                          >
                            {row.name}
                          </Button>
                        ) : (
                          row.name
                        )}
                      </TD>
                      <TD>{row.group}</TD>
                      <TD className="text-right tabular-nums">{formatNumber(row.totalPrice)}</TD>
                      <TD
                        className={cn('text-right tabular-nums', row.debt > 0 && 'text-rose')}
                      >
                        {formatNumber(row.debt)}
                      </TD>
                      <TD className="text-right tabular-nums">{formatNumber(row.paid)}</TD>
                      <TD className="text-right tabular-nums">{formatNumber(row.bonus)}</TD>
                      <TD className="max-w-48">
                        <span className="block truncate" title={row.bonusNote || undefined}>
                          {row.bonusNote || '—'}
                        </span>
                      </TD>
                      <TD className="text-center">
                        {row.date ? (formatDate(row.date, i18n.language) ?? row.date) : '—'}
                      </TD>
                      <TD className="text-center">
                        <StudentPaymentBadge status={row.status} text={row.statusText} />
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </>
        ) : (
          <Table storageKey="payment-history-year" className="min-w-280">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.yrGroup')}</TH>
                <TH className="text-center">{t('paymentHistoryPage.grpStudents')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.eduPrice')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.yrPayable')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.psPaidCol')}</TH>
                <TH className="text-right">UZCARD</TH>
                <TH className="text-right">HUMO</TH>
                <TH className="text-right">{t('paymentHistoryPage.grCash')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.yrTransfer')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.returned')}</TH>
                <TH className="text-right">{t('paymentHistoryPage.debtor')}</TH>
                <TH>{t('paymentHistoryPage.teacher')}</TH>
              </HeaderTR>
            </THead>
            <TBody>
              {yearPageRows.length === 0 ? (
                <EmptyTR colSpan={13} />
              ) : (
                yearPageRows.map((row, index) => (
                  <TR key={`${row.id}-${index}`}>
                    <TD className="text-center text-muted">
                      {(page - 1) * pageSize + index + 1}
                    </TD>
                    <TD className="font-semibold">{row.group}</TD>
                    <TD className="text-center">{row.students}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.price)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.payable)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.paid)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.uzcard)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.humo)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.cash)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.bank)}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(row.returned)}</TD>
                    <TD
                      className={cn(
                        'text-right tabular-nums',
                        row.debt > 0 && 'font-semibold text-rose',
                      )}
                    >
                      {formatNumber(row.debt)}
                    </TD>
                    <TD>{row.teacher}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}

        {tab !== 'org' ? (
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
        ) : null}
      </PageMain>

      <AddPaymentHistoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <StudentPaymentDetailModal
        studentId={detailStudentId}
        onClose={() => setDetailStudentId(null)}
      />
      <PrintCheckModal
        open={Boolean(check)}
        payload={check}
        onClose={() => setCheck(null)}
      />
    </>
  )
}
