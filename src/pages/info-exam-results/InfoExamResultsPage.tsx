import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  FilterTH,
  ListPageSkeleton,
  Notification,
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
import { infoExamResultPath } from '@/config'
import { useInfoExamResultsQuery } from '@/features/info-exam-results'
import { asLangName, asText } from '@/lib/apiPage'
import type { InfoExamResultRow } from '@/types/info-exam-results'

function isActive(status: InfoExamResultRow['status']) {
  return String(status) === '1'
}

export function InfoExamResultsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [word, setWord] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    setPage(1)
  }, [word, status, pageSize])

  const { data, isLoading, isError, error } = useInfoExamResultsQuery({
    page,
    showCount: pageSize,
    word,
    status,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const statusOptions = [
    { value: 'all', label: t('common.all') },
    ...(data?.statuses ?? [])
      .map((item) => {
        const value = item.id == null ? '' : String(item.id)
        if (!value || value === 'all') return null
        const label = asLangName(item.name, i18n.language)
        return {
          value,
          label: label === '—' ? value : label,
        }
      })
      .filter((item): item is { value: string; label: string } => Boolean(item)),
  ]

  return (
    <>
      <Header title={t('infoExamResultsPage.title')} />
      <PageMain fill>
        <Notification tone="warning">
          {t('infoExamResultsPage.info')}
        </Notification>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="info-exam-results">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="name">{t('infoExamResultsPage.examName')}</TH>
                <TH column="group">{t('directorList.group')}</TH>
                <TH column="times">{t('infoExamResultsPage.times')}</TH>
                <TH column="status" className="w-40 text-center">
                  {t('infoExamResultsPage.status')}
                </TH>
              </TR>
              <TR className="bg-white hover:bg-transparent">
                <FilterTH column="index" />
                <FilterTH column="name">
                  <SearchInput
                    size="sm"
                    id="info-exam-search"
                    name="info-exam-search"
                    label={t('infoExamResultsPage.examName')}
                    placeholder={t('infoExamResultsPage.searchName')}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="group" />
                <FilterTH column="times" />
                <FilterTH column="status">
                  <Select
                    size="sm"
                    searchable={false}
                    className="w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value || 'all')}
                    options={statusOptions}
                  />
                </FilterTH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={5}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('infoExamResultsPage.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const start = asText(row.start_time)
                  const end = asText(row.end_time)
                  const active = isActive(row.status)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="name">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                          onClick={() =>
                            navigate(infoExamResultPath(row.id), {
                              state: { examName: row.name?.trim() || '' },
                            })
                          }
                        >
                          {row.name || '—'}
                        </Button>
                      </TD>
                      <TD column="group">
                        {asLangName(row.group, i18n.language)}
                      </TD>
                      <TD column="times">
                        <div className="flex flex-wrap items-center gap-1">
                          {start !== '—' ? (
                            <Badge tone="teal">
                              {start} {t('infoExamResultsPage.from')}
                            </Badge>
                          ) : null}
                          {end !== '—' ? (
                            <Badge tone="rose">
                              {end} {t('infoExamResultsPage.until')}
                            </Badge>
                          ) : start === '—' ? (
                            '—'
                          ) : null}
                        </div>
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={active ? 'teal' : 'rose'}>
                          {active
                            ? t('infoExamResultsPage.active')
                            : t('infoExamResultsPage.inactive')}
                        </Badge>
                      </TD>
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
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}
