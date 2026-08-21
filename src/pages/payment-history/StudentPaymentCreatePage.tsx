import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
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
} from '@/components/ui'
import { paymentStudentPath, routes } from '@/config'
import { usePaymentCreateListQuery } from '@/features/payment-history'
import { useSmartBack } from '@/hooks'
import { fullNameOf } from '@/lib'

export function StudentPaymentCreatePage() {
  const { t } = useTranslation()
  const goBack = useSmartBack(routes.paymentHistory)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('all')
  const [year, setYear] = useState('all')

  const query = usePaymentCreateListQuery({
    page,
    showCount: pageSize,
    search: search || undefined,
    groupId,
    year,
  })
  const data = query.data

  return (
    <>
      <Header
        title={t('paymentHistoryPage.addStudentPayment')}
        onBack={goBack}
        actions={
          <div className="flex flex-nowrap items-end gap-2">
            <Select
              size="md"
              className="w-48 shrink-0"
              value={groupId}
              options={[
                { value: 'all', label: t('paymentHistoryPage.allGroups') },
                ...(data?.groups ?? []).map((item) => ({
                  value: String(item.id),
                  label: item.name_uz || item.name || String(item.id),
                })),
              ]}
              onChange={(e) => {
                setGroupId(e.target.value || 'all')
                setPage(1)
              }}
            />
            <Select
              size="md"
              className="w-36 shrink-0"
              value={year}
              options={[
                { value: 'all', label: t('paymentHistoryPage.allYears') },
                ...(data?.years ?? []).map((item) => ({
                  value: String(item),
                  label: String(item),
                })),
              ]}
              onChange={(e) => {
                setYear(e.target.value || 'all')
                setPage(1)
              }}
            />
            <SearchInput
              className="w-48 shrink-0"
              placeholder={t('common.search')}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        }
      />
      <PageMain fill>
        {query.isLoading ? (
          <ListPageSkeleton />
        ) : query.isError ? (
          <ErrorMessage />
        ) : (
          <Table storageKey="payment-create-students" className="min-w-120">
            <THead>
              <TR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('paymentHistoryPage.fioFull')}</TH>
              </TR>
            </THead>
            <TBody>
              {(data?.students ?? []).length === 0 ? (
                <TR>
                  <TD className="py-6 text-center" colSpan={2}>
                    <EmptyState
                      className="border-0 py-4 shadow-none"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                (data?.students ?? []).map((row, index) => (
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
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={page}
          totalPages={Math.max(1, data?.last_page ?? 1)}
          onPageChange={setPage}
          total={data?.total_items ?? 0}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
