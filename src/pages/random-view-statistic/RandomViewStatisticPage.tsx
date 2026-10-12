import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Pagination,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useRandomTestStatsQuery } from '@/features/director-stats'
import { usePageState } from '@/hooks'
import { asFio } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import type { RandomTestResult } from '@/types/director-stats'

function maskPassport(value: string) {
  const raw = value.replace(/\s+/g, '')
  if (raw.length < 7) return raw || '—'
  return `${raw.slice(0, 3)}**${raw.slice(-2)}`
}

function PassportCell({
  seria,
  number,
}: {
  seria?: string | null
  number?: string | null
}) {
  const full = [seria, number].filter(Boolean).join('')
  const [open, setOpen] = useState(false)
  if (!full) return <>{'—'}</>
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto min-w-24 px-2 py-1 font-medium tabular-nums"
      onClick={() => setOpen((prev) => !prev)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open ? full : maskPassport(full)}
    </Button>
  )
}

function latestResult(results: RandomTestResult[] | null | undefined) {
  const row = results?.[0]
  if (!row) return null
  const has =
    row.updated_at != null ||
    row.question_count != null ||
    row.correct_answers_count != null ||
    row.incorrect_answers_count != null ||
    row.percent != null
  return has ? row : null
}

function formatPercent(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'
  if (typeof value === 'string' && value.includes('%')) return value
  return `${formatNumber(value)} %`
}

export function RandomViewStatisticPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [nameSearch, setNameSearch] = usePageState('nameSearch', '')
  const [groupSearch, setGroupSearch] = usePageState('groupSearch', '')

  useEffect(() => {
    setPage(1)
  }, [nameSearch, groupSearch, pageSize])

  const { data, isLoading, isError } = useRandomTestStatsQuery({
    page,
    showCount: pageSize,
    studentSearch: nameSearch,
    groupSearch,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages =
    data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  return (
    <>
      <Header title={t('statsPage.randomTestReport')} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="random-view-statistic">
            <THead>
              <HeaderTR>
                <TH column="index" rowSpan={2} className="w-10">
                  №
                </TH>
                <TH column="fio" rowSpan={2} className="min-w-52">
                  {t('statsPage.fish')}
                </TH>
                <TH column="group" rowSpan={2} className="min-w-40">
                  {t('directorList.group')}
                </TH>
                <TH column="passport" rowSpan={2} className="min-w-44 whitespace-nowrap">
                  {t('statsPage.passportSeries')}
                </TH>
                <TH colSpan={5} registerColumn={false} className="text-center">
                  {t('statsPage.testResults')}
                </TH>
              </HeaderTR>
              <HeaderTR>
                <TH column="activeTime" className="min-w-28 whitespace-nowrap !px-4 text-center">
                  {t('statsPage.activeTime')}
                </TH>
                <TH column="total" className="min-w-24 whitespace-nowrap !px-4 text-center">
                  {t('statsPage.total')}
                </TH>
                <TH column="correct" className="min-w-32 whitespace-nowrap !px-4 text-center">
                  {t('statsPage.correctAnswer')}
                </TH>
                <TH column="wrong" className="min-w-32 whitespace-nowrap !px-4 text-center">
                  {t('statsPage.wrongAnswer')}
                </TH>
                <TH column="percent" className="min-w-24 whitespace-nowrap !px-4 text-center">
                  {t('statsPage.percent')} (%)
                </TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH column="index" />
                <FilterTH column="fio">
                  <SearchInput
                    size="sm"
                    id="random-stats-fio"
                    name="random-stats-fio"
                    label={t('statsPage.fish')}
                    placeholder={t('common.search')}
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="group">
                  <SearchInput
                    size="sm"
                    id="random-stats-group"
                    name="random-stats-group"
                    label={t('directorList.group')}
                    placeholder={t('common.search')}
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="passport" />
                <FilterTH column="activeTime" />
                <FilterTH column="total" />
                <FilterTH column="correct" />
                <FilterTH column="wrong" />
                <FilterTH column="percent" />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={9} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const result = latestResult(row.random_test_results)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="fio" className="font-medium">
                        {asFio(row)}
                      </TD>
                      <TD column="group">{row.group?.name || '—'}</TD>
                      <TD column="passport" className="whitespace-nowrap">
                        <PassportCell
                          seria={row.passport?.seria}
                          number={row.passport?.number}
                        />
                      </TD>
                      {result ? (
                        <>
                          <TD column="activeTime" className="text-center">
                            <Badge tone="neutral">
                              {formatDate(result.updated_at, i18n.language) ?? '—'}
                            </Badge>
                          </TD>
                          <TD column="total" className="text-center">
                            <Badge tone="signal">
                              {formatNumber(result.question_count)}
                            </Badge>
                          </TD>
                          <TD column="correct" className="text-center">
                            <Badge tone="teal">
                              {formatNumber(result.correct_answers_count)}
                            </Badge>
                          </TD>
                          <TD column="wrong" className="text-center">
                            <Badge tone="rose">
                              {formatNumber(result.incorrect_answers_count)}
                            </Badge>
                          </TD>
                          <TD column="percent" className="text-center">
                            <Badge tone="amber">{formatPercent(result.percent)}</Badge>
                          </TD>
                        </>
                      ) : (
                        <TD
                          column="activeTime"
                          colSpan={5}
                          className="px-6 text-center text-[13px] text-muted"
                        >
                          {t('statsPage.noReport')}
                        </TD>
                      )}
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
