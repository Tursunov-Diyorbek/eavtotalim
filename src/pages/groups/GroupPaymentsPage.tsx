import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Badge,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  Pagination,
  SearchInput,
  Select,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { Header, PageMain } from '@/components/layout'
import { eduTypeShortName, groupShowPath, routes, studentPath } from '@/config'
import {
  useGroupPaymentsQuery,
  useGroupShowQuery,
  useGroupTeachersQuery,
} from '@/features/groups'
import { asLangName, asText } from '@/lib/apiPage'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate, formatNumber, fullNameOf } from '@/lib'
import { cn } from '@/lib/cn'
import { useSmartBack } from '@/hooks'
import type { GroupItem, GroupPaymentRow } from '@/types/groups'

/** Toifa v1 to‘lov javobida `short_name`siz, v2 showda esa to‘liq keladi. */
function eduCategory(group: GroupItem | null | undefined, lang: string) {
  const edu = group?.edu_type
  const candidates = [
    edu?.short_name,
    edu?.short_name_uz,
    edu?.character_name,
    edu?.short_name_en,
    edu?.name_uz,
    edu?.name,
  ]
  for (const value of candidates) {
    const text =
      value && typeof value === 'object' ? asLangName(value, lang) : asText(value)
    if (text !== '—') return text
  }
  const byId = eduTypeShortName(edu?.id ?? group?.edu_type_id)
  return byId !== '—' ? byId : '—'
}

type PayStatus = 'full' | 'partial' | 'none'

function paidSum(row: GroupPaymentRow) {
  return (row.payments ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
}

function lastPayment(row: GroupPaymentRow) {
  const dates = (row.payments ?? [])
    .map((item) => item.payment_date || item.created_at || item.date || '')
    .filter(Boolean)
    .sort()
  return dates.at(-1) || ''
}

function paymentCells(row: GroupPaymentRow) {
  const price = Number(row.education_price ?? 0)
  const paid = paidSum(row)
  const debt = Math.max(0, price - paid)
  const status: PayStatus = paid <= 0 ? 'none' : debt <= 0 ? 'full' : 'partial'
  return { price, paid, debt, status, last: lastPayment(row) }
}

function shareLabel(count: number, total: number) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return `${count} (${pct}%)`
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'teal' | 'amber' | 'rose'
}) {
  return (
    <div
      className={cn(
        'min-w-0 flex-1 rounded-lg border border-mist/70 bg-white px-3 py-2.5',
        tone === 'teal' && 'border-l-4 border-l-teal',
        tone === 'amber' && 'border-l-4 border-l-amber',
        tone === 'rose' && 'border-l-4 border-l-rose',
      )}
    >
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          'mt-1 text-xl font-semibold text-deep',
          tone === 'teal' && 'text-teal',
          tone === 'amber' && 'text-amber',
          tone === 'rose' && 'text-rose',
        )}
      >
        {value}
      </p>
    </div>
  )
}

/** Eski guruh to‘lov hisoboti — statistika, taqsimot, holat. */
export function GroupPaymentsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const goBack = useSmartBack(id ? groupShowPath(id) : routes.groups)
  const query = useGroupPaymentsQuery(id)
  const showQuery = useGroupShowQuery(id)
  const teachersQuery = useGroupTeachersQuery(id)
  const rows = query.data?.rows ?? []
  const group = query.data?.group
  const groupName = asLangName(group?.name_uz ?? group?.name, i18n.language)
  const eduFromPayments = eduCategory(group, i18n.language)
  const edu =
    eduFromPayments !== '—'
      ? eduFromPayments
      : eduCategory(showQuery.data, i18n.language)
  const teacherName =
    fullNameOf(teachersQuery.data?.[0]?.teacher) || '—'

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | PayStatus>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const prepared = useMemo(
    () => rows.map((row) => ({ row, cells: paymentCells(row), name: fullNameOf(row) ?? '' })),
    [rows],
  )
  const counts = useMemo(() => {
    const full = prepared.filter((item) => item.cells.status === 'full').length
    const partial = prepared.filter((item) => item.cells.status === 'partial').length
    const none = prepared.filter((item) => item.cells.status === 'none').length
    return { total: prepared.length, full, partial, none }
  }, [prepared])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return prepared.filter((item) => {
      if (status && item.cells.status !== status) return false
      if (q && !item.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [prepared, search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const statusLabel = (value: PayStatus) =>
    t(
      value === 'full'
        ? 'groupsPage.showPage.payStatusFull'
        : value === 'partial'
          ? 'groupsPage.showPage.payStatusPartial'
          : 'groupsPage.showPage.payStatusNone',
    )

  const exportRows = filtered.map((item, index) => [
    index + 1,
    item.name,
    item.cells.price,
    item.cells.paid,
    item.cells.debt,
    statusLabel(item.cells.status),
    item.cells.last ? formatDate(item.cells.last, i18n.language) : '—',
  ])

  return (
    <>
      <Header
        onBack={goBack}
        title={
          groupName !== '—'
            ? `${t('groupsPage.showPage.payGroup')}: ${groupName}`
            : t('groupsPage.showPage.paymentHistory')
        }
        description={`${t('groupsPage.showPage.payTeacher')}: ${teacherName} · ${t('groupsPage.showPage.payEdu')}: ${edu}`}
        actions={
          <ExportButton
            disabled={query.isLoading || filtered.length === 0}
            onClick={() =>
              downloadXls(
                'guruh-tolovlari',
                [
                  '№',
                  t('directorList.fio'),
                  t('groupsPage.showPage.payTotalPrice'),
                  t('groupsPage.showPage.paid'),
                  t('groupsPage.showPage.payDebtLeft'),
                  t('groupsPage.showPage.payStatus'),
                  t('groupsPage.showPage.payLast'),
                ],
                exportRows,
              )
            }
          />
        }
      />
      <PageMain fill>
        {query.isLoading ? (
          <SkeletonLines lines={8} />
        ) : query.isError || !id ? (
          <ErrorMessage />
        ) : (
          <>
            <div className="flex shrink-0 flex-wrap gap-2">
              <StatCard
                label={t('groupsPage.showPage.payStudentsTotal')}
                value={String(counts.total)}
              />
              <StatCard
                label={t('groupsPage.showPage.payFull')}
                value={shareLabel(counts.full, counts.total)}
                tone="teal"
              />
              <StatCard
                label={t('groupsPage.showPage.payPartial')}
                value={shareLabel(counts.partial, counts.total)}
                tone="amber"
              />
              <StatCard
                label={t('groupsPage.showPage.payNone')}
                value={shareLabel(counts.none, counts.total)}
                tone="rose"
              />
            </div>
            <div className="flex h-2 shrink-0 overflow-hidden rounded-full bg-fog">
              {counts.total > 0 ? (
                <>
                  <div
                    className="bg-teal"
                    style={{ width: `${(counts.full / counts.total) * 100}%` }}
                  />
                  <div
                    className="bg-amber"
                    style={{ width: `${(counts.partial / counts.total) * 100}%` }}
                  />
                  <div
                    className="bg-rose"
                    style={{ width: `${(counts.none / counts.total) * 100}%` }}
                  />
                </>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-end gap-2">
              <SearchInput
                className="min-w-56 flex-1"
                size="sm"
                debounceMs={0}
                value={search}
                placeholder={t('groupsPage.showPage.paySearch')}
                aria-label={t('groupsPage.showPage.paySearch')}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
              <Select
                className="w-full sm:w-56"
                size="sm"
                value={status}
                placeholder={t('groupsPage.showPage.payStatusAll')}
                options={[
                  { value: '', label: t('groupsPage.showPage.payStatusAll') },
                  { value: 'full', label: t('groupsPage.showPage.payStatusFull') },
                  { value: 'partial', label: t('groupsPage.showPage.payStatusPartial') },
                  { value: 'none', label: t('groupsPage.showPage.payStatusNone') },
                ]}
                onChange={(e) => {
                  setStatus(e.target.value as '' | PayStatus)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <Table storageKey="group-payments" className="min-w-200">
                <THead>
                  <TR>
                    <TH className="w-12 text-center">№</TH>
                    <TH>{t('directorList.fio')}</TH>
                    <TH className="text-right">{t('groupsPage.showPage.payTotalPrice')}</TH>
                    <TH className="text-right">{t('groupsPage.showPage.paid')}</TH>
                    <TH className="text-right">{t('groupsPage.showPage.payDebtLeft')}</TH>
                    <TH>{t('groupsPage.showPage.payStatus')}</TH>
                    <TH>{t('groupsPage.showPage.payLast')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {pageRows.length === 0 ? (
                    <EmptyTR colSpan={7} />
                  ) : (
                    pageRows.map((item, index) => (
                      <TR
                        key={item.row.id ?? index}
                        className={item.row.id != null ? 'cursor-pointer' : undefined}
                        onClick={() => {
                          if (item.row.id != null) navigate(studentPath(item.row.id))
                        }}
                      >
                        <TD className="text-center text-muted">
                          {(safePage - 1) * pageSize + index + 1}
                        </TD>
                        <TD className="font-medium text-signal">{item.name || '—'}</TD>
                        <TD className="text-right">{formatNumber(item.cells.price)}</TD>
                        <TD className="text-right">{formatNumber(item.cells.paid)}</TD>
                        <TD
                          className={cn(
                            'text-right',
                            item.cells.debt > 0 && 'font-semibold text-rose',
                          )}
                        >
                          {formatNumber(item.cells.debt)}
                        </TD>
                        <TD>
                          <Badge
                            tone={
                              item.cells.status === 'full'
                                ? 'teal'
                                : item.cells.status === 'partial'
                                  ? 'amber'
                                  : 'rose'
                            }
                          >
                            {statusLabel(item.cells.status)}
                          </Badge>
                        </TD>
                        <TD>
                          {formatDate(item.cells.last, i18n.language) ?? '—'}
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
            <Pagination
              className="shrink-0"
              page={safePage}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </>
        )}
      </PageMain>
    </>
  )
}
