import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
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
} from '@/components/ui'
import { groupShowPath, studentPath } from '@/config'
import { useRefundsQuery } from '@/features/refund'
import { asLangName, formatDate, formatNumber, fullNameOf } from '@/lib'
import { RefundFormModal } from './RefundFormModal'

export function RefundPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [word, setWord] = useState('')
  const [groupId, setGroupId] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [word, groupId, pageSize])

  const query = useRefundsQuery({
    page,
    showCount: pageSize,
    word: word.trim() || undefined,
    groupId: groupId || undefined,
  })
  const rows = query.data?.data ?? []
  const groups = query.data?.groups ?? []
  const total = query.data?.total_items ?? 0
  const totalPages =
    query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const groupOptions = [
    { value: '', label: t('paymentHistoryPage.allGroups') },
    ...groups.map((item) => ({
      value: String(item.id),
      label: asLangName(item, i18n.language),
    })),
  ]

  return (
    <>
      <Header
        title={t('refundPage.title')}
        actions={
          <div className="flex flex-nowrap items-end gap-2">
            <SearchInput
              size="sm"
              className="w-48 shrink-0"
              placeholder={t('refundPage.search')}
              onChange={(e) => setWord(e.target.value)}
            />
            <Select
              size="sm"
              className="w-48 shrink-0"
              clearable
              value={groupId}
              placeholder={t('refundPage.groups')}
              options={groupOptions}
              onChange={(e) => setGroupId(e.target.value)}
            />
            <AddButton onClick={() => setAddOpen(true)} />
          </div>
        }
      />
      <PageMain fill>
        {query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="refund-list" className="min-w-220">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('refundPage.fio')}</TH>
                <TH>{t('refundPage.groups')}</TH>
                <TH className="text-center">{t('refundPage.amount')}</TH>
                <TH className="text-center">{t('refundPage.date')}</TH>
                <TH>{t('refundPage.comment')}</TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH />
                <FilterTH>
                  <TableSearch
                    label={t('common.search')}
                    placeholder={t('refundPage.search')}
                    onChange={(e) => setWord(e.target.value)}
                  />
                </FilterTH>
                <FilterTH>
                  <Select
                    size="sm"
                    clearable
                    value={groupId}
                    placeholder={t('refundPage.groups')}
                    options={groupOptions}
                    onChange={(e) => setGroupId(e.target.value)}
                  />
                </FilterTH>
                <FilterTH />
                <FilterTH />
                <FilterTH />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={6} />
              ) : (
                rows.map((row, index) => {
                  const studentId = row.student?.id
                  const groupRowId = row.group?.id
                  const name = fullNameOf(row.student) || '—'
                  const groupName = row.group
                    ? asLangName(row.group, i18n.language)
                    : '—'
                  return (
                    <TR key={row.id ?? `${studentId ?? 's'}-${index}`}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        {studentId ? (
                          <Link
                            to={studentPath(studentId)}
                            className="font-semibold text-signal hover:underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          name
                        )}
                      </TD>
                      <TD>
                        {groupRowId ? (
                          <Link
                            to={groupShowPath(groupRowId)}
                            className="text-signal hover:underline"
                          >
                            {groupName}
                          </Link>
                        ) : (
                          groupName
                        )}
                      </TD>
                      <TD className="text-center whitespace-nowrap">
                        {formatNumber(row.amount)}
                      </TD>
                      <TD className="text-center whitespace-nowrap">
                        {formatDate(row.returned_date) || row.returned_date || '—'}
                      </TD>
                      <TD>{row.description || '—'}</TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </PageMain>
      <RefundFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groups={groups}
      />
    </>
  )
}
