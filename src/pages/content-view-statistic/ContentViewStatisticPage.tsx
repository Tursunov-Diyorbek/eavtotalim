import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Pagination,
  Table,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import { useContentViewGroupsQuery } from '@/features/director-stats'
import { formatNumber } from '@/lib/format'

export function ContentViewStatisticPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('0')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setPage(1)
  }, [tab, pageSize])

  const { data, isLoading, isError } = useContentViewGroupsQuery({
    page,
    showCount: pageSize,
    eduStatus: tab,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const tabItems = useMemo(
    () => [
      { value: '0', label: t('groupsPage.tabNew') },
      { value: '1', label: t('groupsPage.tabActive') },
      { value: '2', label: t('groupsPage.tabFinished') },
    ],
    [t],
  )

  return (
    <>
      <Header title={t('nav.contentViewStatistic')} />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Tabs items={tabItems} value={tab} onChange={setTab} />
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>{t('directorList.group')}</TH>
                <TH>{t('directorList.eduType')}</TH>
                <TH>{t('directorList.studentsCount')}</TH>
                <TH>{t('statsPage.mastery')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => (
                <TR
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      routes.contentViewByStudents.replace(':id', String(row.id)),
                    )
                  }
                >
                  <TD className="text-muted">
                    {(page - 1) * pageSize + index + 1}
                  </TD>
                  <TD className="font-medium text-signal">{row.name || '—'}</TD>
                  <TD>{row.edu_type?.short_name || '—'}</TD>
                  <TD>
                    <Badge tone="signal">
                      {formatNumber(row.students_count)} {t('statsPage.pcs')}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={row.group_topic_action_report ? 'teal' : 'rose'}>
                      {row.group_topic_action_report != null
                        ? `${row.group_topic_action_report}%`
                        : '—'}
                    </Badge>
                  </TD>
                </TR>
              ))}
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
      </main>
    </>
  )
}
