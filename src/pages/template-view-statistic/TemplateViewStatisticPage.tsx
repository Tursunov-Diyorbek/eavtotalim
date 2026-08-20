import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  FilterTH,
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
import { templateViewStudentPath } from '@/config'
import { useTemplateTestStatsQuery } from '@/features/director-stats'
import { asFio } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'
import type { TemplateStatRow } from '@/types/director-stats'

function maskPassport(value: string) {
  const raw = value.replace(/\s+/g, '')
  if (raw.length < 4) return raw || '—'
  return `${raw.slice(0, 1)}${'*'.repeat(Math.max(2, raw.length - 2))}${raw.slice(-1)}`
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

function openStudent(
  navigate: ReturnType<typeof useNavigate>,
  row: TemplateStatRow,
) {
  navigate(templateViewStudentPath(row.id), {
    state: { fullName: asFio(row) },
  })
}

export function TemplateViewStatisticPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [nameSearch, setNameSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')

  useEffect(() => {
    setPage(1)
  }, [nameSearch, groupSearch, pageSize])

  const { data, isLoading, isError } = useTemplateTestStatsQuery({
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
      <Header title={t('statsPage.templateTestReport')} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="template-view-statistic">
            <THead>
              <TR className="hover:bg-transparent">
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="fio" className="min-w-52">
                  {t('statsPage.fish')}
                </TH>
                <TH column="group" className="min-w-40">
                  {t('directorList.group')}
                </TH>
                <TH column="passport">{t('statsPage.passportSeries')}</TH>
                <TH
                  column="results"
                  colSpan={4}
                  registerColumn={false}
                  className="text-center"
                >
                  {t('statsPage.testResults')}
                </TH>
                <TH column="actions" className="w-20">
                  {t('common.actions')}
                </TH>
              </TR>
              <TR className="bg-white hover:bg-transparent">
                <FilterTH column="index" />
                <FilterTH column="fio">
                  <SearchInput
                    size="sm"
                    id="template-stats-fio"
                    name="template-stats-fio"
                    label={t('statsPage.fish')}
                    placeholder={t('common.search')}
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="group">
                  <SearchInput
                    size="sm"
                    id="template-stats-group"
                    name="template-stats-group"
                    label={t('directorList.group')}
                    placeholder={t('common.search')}
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="passport" />
                <TH column="activeTime">{t('statsPage.activeTime')}</TH>
                <TH column="templates">{t('statsPage.templatesCount')}</TH>
                <TH column="average">{t('statsPage.averageCorrect')}</TH>
                <TH column="corrects">{t('statsPage.totalCorrect')}</TH>
                <FilterTH column="actions" />
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={9}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('common.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                rows.map((row, index) => {
                  const report = row.template_test_student_report
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="fio">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                          onClick={() => openStudent(navigate, row)}
                        >
                          {asFio(row)}
                        </Button>
                      </TD>
                      <TD column="group">{row.group?.name || '—'}</TD>
                      <TD column="passport" className="whitespace-nowrap">
                        <PassportCell
                          seria={row.passport?.seria}
                          number={row.passport?.number}
                        />
                      </TD>
                      {report ? (
                        <>
                          <TD column="activeTime" className="text-center">
                            <Badge tone="neutral">
                              {formatDate(report.updated_at, i18n.language) ??
                                '—'}
                            </Badge>
                          </TD>
                          <TD column="templates" className="text-center">
                            <Badge
                              tone="signal"
                              className="min-w-8 justify-center rounded-full"
                            >
                              {formatNumber(report.templates_count_done)}
                            </Badge>
                          </TD>
                          <TD column="average" className="text-center">
                            <Badge
                              tone="teal"
                              className="min-w-8 justify-center rounded-full"
                            >
                              {formatNumber(report.average_corrects)}
                            </Badge>
                          </TD>
                          <TD column="corrects" className="text-center">
                            <Badge
                              tone="signal"
                              className="min-w-8 justify-center rounded-full"
                            >
                              {formatNumber(report.corrects_count)}
                            </Badge>
                          </TD>
                        </>
                      ) : (
                        <TD
                          column="activeTime"
                          className="text-center text-muted"
                          colSpan={4}
                        >
                          {t('statsPage.noReport')}
                        </TD>
                      )}
                      <TD column="actions" className="text-center">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="rounded-full"
                          aria-label={t('common.view')}
                          onClick={() => openStudent(navigate, row)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
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
