import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  Select,
  Table,
  TableSearch,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useDebtorFilterGroupsQuery, useDebtorsQuery } from '@/features/debtors'
import { useOpenedOnce, usePageState } from '@/hooks'
import { formatNumber, formatPhoneLocal, fullNameOf, parsePhoneDigits } from '@/lib'
import type { DebtorRow } from '@/types/debtors'
import { NoAgreementGate } from './NoAgreementGate'

function moneyLabel(value: number | string | null | undefined, som: string) {
  return `${formatNumber(value)} ${som}`
}

function phoneLabel(raw: string | null | undefined) {
  const digits = parsePhoneDigits(raw)
  if (!digits) return '—'
  return `+998 ${formatPhoneLocal(digits)}`
}

function teacherName(row: DebtorRow) {
  const teachers = row.group?.teachers ?? []
  const onDoc = teachers.find(
    (item) => Number(item.type_teacher_for_group?.type_on_doc) === 1,
  )
  const pick = onDoc ?? teachers[0]
  const teacher = pick?.teacher
  if (!teacher) return ''
  return [teacher.last_name, teacher.first_name].filter(Boolean).join(' ')
}

function groupName(row: DebtorRow) {
  return row.group?.name_uz || row.group?.name || '—'
}

export function DebtorsPage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const hasAgreement = me?.profession?.organization?.last_agreement?.status === 1
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [fio, setFio] = usePageState('fio', '')
  const [groupId, setGroupId] = usePageState('groupId', '')

  useEffect(() => {
    setPage(1)
  }, [fio, groupId, pageSize])

  const [groupsEnabled, openGroups] = useOpenedOnce(Boolean(groupId))
  const groupsQuery = useDebtorFilterGroupsQuery(groupsEnabled)
  const query = useDebtorsQuery(
    {
      page,
      showCount: pageSize,
      fio: fio.trim() || undefined,
      groupId: groupId || undefined,
    },
    hasAgreement,
  )
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages = query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const som = t('debtorsPage.som')

  return (
    <>
      <Header title={t('debtorsPage.title')} />
      <PageMain fill>
        {!hasAgreement ? (
          <NoAgreementGate />
        ) : query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="debtors-list" className="min-w-220">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('directorList.fio')}</TH>
                <TH>{t('directorList.group')}</TH>
                <TH>{t('debtorsPage.teacher')}</TH>
                <TH className="text-center">{t('directorList.phone')}</TH>
                <TH className="text-center">{t('debtorsPage.debt')}</TH>
                <TH className="text-center">{t('debtorsPage.paid')}</TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH />
                <FilterTH>
                  <TableSearch
                    label={t('common.search')}
                    placeholder={t('common.search')}
                    value={fio}
                    onChange={(e) => setFio(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    size="sm"
                    clearable
                    value={groupId}
                    placeholder={t('directorList.group')}
                    onOpen={openGroups}
                    loading={groupsQuery.isFetching && !groupsQuery.data?.length}
                    options={[
                      { value: '', label: t('paymentHistoryPage.allGroups') },
                      ...(groupsQuery.data ?? []).map((item) => ({
                        value: String(item.id),
                        label: item.name_uz || item.name || String(item.id),
                      })),
                    ]}
                    onChange={(e) => setGroupId(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
                <FilterTH />
                <FilterTH />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={7} />
              ) : (
                rows.map((row, index) => {
                  const name = fullNameOf(row) ?? '—'
                  const teacher = teacherName(row)
                  return (
                    <TR key={row.id ?? index}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD className="font-semibold text-deep">{name}</TD>
                      <TD>{groupName(row)}</TD>
                      <TD className={teacher ? undefined : 'text-muted'}>
                        {teacher || t('debtorsPage.notEntered')}
                      </TD>
                      <TD className="text-center whitespace-nowrap">
                        {phoneLabel(row.phone)}
                      </TD>
                      <TD className="text-center">
                        <Badge tone="rose">{moneyLabel(row.debt, som)}</Badge>
                      </TD>
                      <TD className="text-center">
                        <Badge tone="teal">
                          {moneyLabel(row.payments_sum_amount, som)}
                        </Badge>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        {hasAgreement ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </PageMain>
    </>
  )
}
